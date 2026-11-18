import logging
from datetime import date, datetime

import requests
from fastapi import HTTPException, Request, status
from pydantic import ValidationError

from api.config import Settings
from api.github.models import (
    ContributionCalendarModel,
    ContributionsModel,
    EventModel,
    EventsResponseModel,
    RepoModel,
)
from api.utils.cache import cache
from api.utils.calendar import calendar_date_range

logger = logging.getLogger(__name__)

CONTRIBUTIONS_QUERY = """
    query DashboardContributions($login: String!) {
        user(login: $login) {
            contributionsCollection {
                startedAt
                endedAt
                contributionCalendar {
                    totalContributions
                    weeks {
                        firstDay
                        contributionDays {
                            date
                            weekday
                            contributionCount
                            contributionLevel
                        }
                    }
                }
            }
        }
    }
"""


@cache("github:contributions:v2", ContributionCalendarModel, ttl=60 * 60)
async def retrieve_contributions(
    request: Request, username: str, as_of: str
) -> ContributionCalendarModel:
    # The username and local end date identify the fixed display window.
    if not Settings.GITHUB_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Set GITHUB_TOKEN on the API to enable the GitHub contribution calendar.",
        )

    try:
        response = requests.post(
            "https://api.github.com/graphql",
            json={
                "operationName": "DashboardContributions",
                "query": CONTRIBUTIONS_QUERY,
                "variables": {"login": username},
            },
            headers={
                "Authorization": f"Bearer {Settings.GITHUB_TOKEN}",
                "Accept": "application/vnd.github+json",
                "User-Agent": "homelab-dashboard",
            },
            timeout=(5, 20),
        )
        response.raise_for_status()
    except requests.exceptions.Timeout:
        detail = "GitHub contribution calendar timed out. Try again later."
    except requests.exceptions.HTTPError as error:
        upstream = error.response
        code = upstream.status_code if upstream is not None else None
        if code == 401:
            detail = (
                "GitHub token is invalid or expired. Update GITHUB_TOKEN on the API."
            )
        elif code in (403, 429):
            detail = "GitHub denied or rate-limited the calendar request. Check token access or try again later."
        else:
            detail = "GitHub contribution calendar is unavailable. Try again later."
    except requests.exceptions.RequestException:
        detail = "Could not connect to GitHub for the contribution calendar. Try again later."
    else:
        try:
            payload = response.json()
            if payload.get("errors"):
                raise ValueError("GraphQL errors")
            user = payload["data"]["user"]
            if user is None:
                raise ValueError("Unknown GitHub user")
            collection = user["contributionsCollection"]
            calendar = ContributionCalendarModel(
                username=username,
                window_start=datetime.fromisoformat(collection["startedAt"]).date(),
                window_end=datetime.fromisoformat(collection["endedAt"]).date(),
                **collection["contributionCalendar"],
            )
            start, end = calendar_date_range(date.fromisoformat(as_of))
            weeks = []
            for week in calendar.weeks:
                days = [day for day in week.days if start <= day.date <= end]
                if days:
                    weeks.append(week.model_copy(update={"days": days}))
            if not weeks:
                raise ValueError("No contribution dates in the requested window")
            return calendar.model_copy(
                update={
                    "window_start": start,
                    "window_end": end,
                    "weeks": weeks,
                    "total_contributions": sum(
                        day.contribution_count for week in weeks for day in week.days
                    ),
                }
            )
        except ValueError, TypeError, KeyError, AttributeError, ValidationError:
            detail = (
                "GitHub returned invalid calendar data or could not complete the query. "
                "Check the username and token access."
            )

    logger.warning("GitHub contribution calendar failed: %s", detail)
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail
    ) from None


@cache("github:events", EventsResponseModel, ttl=60 * 60)
async def retrieve_events(request: Request) -> EventsResponseModel:
    url = f"https://api.github.com/users/{Settings.GITHUB_USERNAME}/events/public?per_page=100"

    events: list[EventModel] = []
    events_seen: dict[str, int] = {}
    repos_seen: set[RepoModel] = set()
    contributions = ContributionsModel()

    try:
        for i in range(3):
            r = requests.get(f"{url}&page={i + 1}")
            raw_data = r.json()

            if (
                "message" in raw_data
                and "API rate limit exceeded" in raw_data["message"]
            ):
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="GitHub API Rate Limit Exceeded",
                )

            for event in raw_data:
                event_model = EventModel(
                    id=event["id"],
                    type=event["type"],
                    commits=(
                        len(event["payload"]["commits"])
                        if "commits" in event["payload"]
                        else 0
                    ),
                    repo=RepoModel(
                        id=event["repo"]["id"],
                        name=event["repo"]["name"],
                        url=event["repo"]["url"],
                    ),
                    created_at=event["created_at"],
                )
                events.append(event_model)
                events_seen[event["type"]] = events_seen.get(event["type"], 0) + 1
                if event["type"] != "ForkEvent" and event["type"] != "WatchEvent":
                    repos_seen.add(
                        RepoModel(
                            id=event["repo"]["id"],
                            name=event["repo"]["name"],
                            url=event["repo"]["url"],
                        )
                    )
                if event["repo"]["name"].startswith(Settings.GITHUB_USERNAME):
                    contributions.own_projects += (
                        len(event["payload"]["commits"])
                        if "commits" in event["payload"]
                        else 1
                    )
                elif event["type"].startswith("Issue") or event["type"].startswith(
                    "Pull"
                ):
                    contributions.oss_projects += 1

        return EventsResponseModel(
            events=events,
            events_seen=events_seen,
            repos_seen=list(repos_seen),
            contributions=contributions,
        )
    except requests.exceptions.ConnectionError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to GitHub API Refused",
        )
