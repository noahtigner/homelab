import json
import logging

import requests
from fastapi import APIRouter, HTTPException, Request, Response, status

from api.config import Settings
from api.copilot.models import (
    CopilotEditorModel,
    CopilotLanguageModel,
    CopilotMetricsModel,
    CopilotModelUsageModel,
    CopilotResponseModel,
    CopilotSummaryModel,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/copilot",
    tags=["Copilot"],
)


def get_headers():
    return {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {Settings.GITHUB_TOKEN}",
        "X-GitHub-Api-Version": "2022-11-28",
    }


@router.get("/", response_model=CopilotResponseModel)
async def get_copilot_usage(request: Request, response: Response):
    org = Settings.GITHUB_ORG

    # Try to get the result from cache
    cached_result = await request.app.state.redis.get("copilot_usage")
    if cached_result is not None:
        logger.info("Cache hit for copilot_usage")
        return CopilotResponseModel(**json.loads(cached_result))

    summary: CopilotSummaryModel | None = None
    metrics: CopilotMetricsModel | None = None

    try:
        # Get Copilot billing/seat summary
        summary_url = f"https://api.github.com/orgs/{org}/copilot/billing"
        summary_response = requests.get(summary_url, headers=get_headers())

        if summary_response.status_code == 200:
            summary_data = summary_response.json()
            seats_data = summary_data.get("seats", {})
            seats_assigned = (
                seats_data.get("total_seats", 0)
                if isinstance(seats_data, dict)
                else 0
            )
            seat_breakdown = summary_data.get("seat_breakdown", {})
            seat_management = summary_data.get("seat_management_setting", {})
            summary = CopilotSummaryModel(
                total_seats=summary_data.get("total_seats", 0),
                seats_assigned=seats_assigned,
                seats_active_this_cycle=seat_breakdown.get(
                    "active_this_cycle", 0
                ),
                seats_inactive_this_cycle=seat_breakdown.get(
                    "inactive_this_cycle", 0
                ),
                seat_breakdown_by_status=(
                    seat_management if isinstance(seat_management, dict) else {}
                ),
            )
        elif summary_response.status_code == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="GitHub API authentication failed",
            )
        elif summary_response.status_code == 403:
            try:
                error_msg = summary_response.json().get('message', 'Unknown error')
            except (ValueError, requests.exceptions.JSONDecodeError):
                error_msg = 'Unknown error'
            logger.warning(
                f"Access forbidden for copilot billing: {error_msg}"
            )
        elif summary_response.status_code == 404:
            logger.warning(
                f"Copilot billing not found for org {org}"
            )

        # Get Copilot usage metrics
        metrics_url = f"https://api.github.com/orgs/{org}/copilot/metrics"
        metrics_response = requests.get(metrics_url, headers=get_headers())

        if metrics_response.status_code == 200:
            metrics_data = metrics_response.json()

            # Aggregate metrics from all days returned
            total_active_users = 0
            total_engaged_users = 0
            languages_dict: dict[str, int] = {}
            editors_dict: dict[str, int] = {}
            models_dict: dict[str, tuple[bool, int]] = {}

            for day_data in metrics_data:
                total_active_users = max(
                    total_active_users, day_data.get("total_active_users", 0)
                )
                total_engaged_users = max(
                    total_engaged_users, day_data.get("total_engaged_users", 0)
                )

                # Aggregate copilot_ide_code_completions
                ide_completions = day_data.get(
                    "copilot_ide_code_completions", {}
                )
                for editor in ide_completions.get("editors", []):
                    editor_name = editor.get("name", "Unknown")
                    engaged = editor.get("total_engaged_users", 0)
                    editors_dict[editor_name] = max(
                        editors_dict.get(editor_name, 0), engaged
                    )
                    for model in editor.get("models", []):
                        model_name = model.get("name", "Unknown")
                        is_custom = model.get("is_custom_model", False)
                        model_engaged = model.get("total_engaged_users", 0)
                        if model_name in models_dict:
                            models_dict[model_name] = (
                                is_custom,
                                max(models_dict[model_name][1], model_engaged),
                            )
                        else:
                            models_dict[model_name] = (is_custom, model_engaged)
                        for lang in model.get("languages", []):
                            lang_name = lang.get("name", "Unknown")
                            lang_engaged = lang.get("total_engaged_users", 0)
                            languages_dict[lang_name] = max(
                                languages_dict.get(lang_name, 0), lang_engaged
                            )

                # Also check copilot_ide_chat for additional models/editors
                ide_chat = day_data.get("copilot_ide_chat", {})
                for editor in ide_chat.get("editors", []):
                    editor_name = editor.get("name", "Unknown")
                    engaged = editor.get("total_engaged_users", 0)
                    editors_dict[editor_name] = max(
                        editors_dict.get(editor_name, 0), engaged
                    )
                    for model in editor.get("models", []):
                        model_name = model.get("name", "Unknown")
                        is_custom = model.get("is_custom_model", False)
                        model_engaged = model.get("total_engaged_users", 0)
                        if model_name in models_dict:
                            models_dict[model_name] = (
                                is_custom,
                                max(models_dict[model_name][1], model_engaged),
                            )
                        else:
                            models_dict[model_name] = (is_custom, model_engaged)

            metrics = CopilotMetricsModel(
                total_active_users=total_active_users,
                total_engaged_users=total_engaged_users,
                languages=[
                    CopilotLanguageModel(name=name, total_engaged_users=count)
                    for name, count in sorted(
                        languages_dict.items(), key=lambda x: x[1], reverse=True
                    )
                ],
                editors=[
                    CopilotEditorModel(name=name, total_engaged_users=count)
                    for name, count in sorted(
                        editors_dict.items(), key=lambda x: x[1], reverse=True
                    )
                ],
                models=[
                    CopilotModelUsageModel(
                        name=name, is_custom_model=data[0],
                        total_engaged_users=data[1]
                    )
                    for name, data in sorted(
                        models_dict.items(), key=lambda x: x[1][1], reverse=True
                    )
                ],
            )
        elif metrics_response.status_code == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="GitHub API authentication failed",
            )
        elif metrics_response.status_code == 403:
            try:
                error_msg = metrics_response.json().get('message', 'Unknown error')
            except (ValueError, requests.exceptions.JSONDecodeError):
                error_msg = 'Unknown error'
            logger.warning(
                f"Access forbidden for copilot metrics: {error_msg}"
            )
        elif metrics_response.status_code == 404:
            logger.warning(f"Copilot metrics not found for org {org}")

        output = CopilotResponseModel(summary=summary, metrics=metrics)

        # Cache the results for 1 hour
        await request.app.state.redis.set(
            "copilot_usage", output.model_dump_json()
        )
        await request.app.state.redis.expire("copilot_usage", 60 * 60)

        return output

    except requests.exceptions.ConnectionError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to GitHub API Refused",
        )
