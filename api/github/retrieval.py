import logging

import requests
from fastapi import HTTPException, Request, status

from api.config import Settings
from api.github.models import (ContributionsModel, EventModel,
                               EventsResponseModel, RepoModel)
from api.utils.cache import cache

logger = logging.getLogger(__name__)


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

            if "message" in raw_data and "API rate limit exceeded" in raw_data["message"]:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="GitHub API Rate Limit Exceeded",
                )

            for event in raw_data:
                event_model = EventModel(
                    id=event["id"],
                    type=event["type"],
                    commits=(
                        len(event["payload"]["commits"]) if "commits" in event["payload"] else 0
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
                        len(event["payload"]["commits"]) if "commits" in event["payload"] else 1
                    )
                elif event["type"].startswith("Issue") or event["type"].startswith("Pull"):
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
