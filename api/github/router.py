import json
import logging

import requests
from fastapi import APIRouter, HTTPException, Request, Response, status

from api.config import Settings
from api.github.models import (
    ContributionsModel,
    EventModel,
    EventsResponseModel,
    RepoModel,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/github",
    tags=["GitHub"],
)


@router.get("/events/", response_model=EventsResponseModel)
async def get_events(request: Request, response: Response):
    url = f"https://api.github.com/users/{Settings.GITHUB_USERNAME}/events/public?per_page=100"

    # Try to get the result from cache
    cached_result = await request.app.state.redis.get("events")
    if cached_result is not None:
        logger.info("Cache hit")
        return EventsResponseModel(**json.loads(cached_result))

    events: list[EventModel] = []
    events_seen: dict(str, int) = {}
    repos_seen: set(RepoModel) = set()
    contributions = ContributionsModel()

    try:
        for i in range(3):
            r = requests.get(f"{url}&page={i + 1}")
            response.status_code = r.status_code
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
                EventModel(
                    id=event["id"],
                    type=event["type"],
                    commits=(
                        len(event["payload"]["commits"])
                        if "commits" in event["payload"]
                        else 0
                    ),
                    repo=event["repo"],
                    created_at=event["created_at"],
                )
                events.append(event)
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

        output = EventsResponseModel(
            events=events,
            events_seen=events_seen,
            repos_seen=list(repos_seen),
            contributions=contributions,
        )

        # Cache the results
        await request.app.state.redis.set("events", output.model_dump_json())
        await request.app.state.redis.expire("events", 3600)  # 1 hour

        return output
    except requests.exceptions.ConnectionError as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to GitHub API Refused",
        )
