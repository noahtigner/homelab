import logging

import requests
from fastapi import HTTPException, Request, status

from api.config import Settings
from api.plex.models import (
    PlexHealthResponse,
    PlexLibraryCountsResponse,
    PlexLibrarySection,
    PlexPlayer,
    PlexSession,
    PlexSessionsResponse,
)
from api.utils.cache import cache

logger = logging.getLogger(__name__)

PLEX_HEADERS = {
    "Accept": "application/json",
    "X-Plex-Token": Settings.PLEX_API_TOKEN,
}


def get_plex_base_url() -> str:
    """Get the base URL for Plex API requests."""
    return f"http://{Settings.SERVER_IP}:32400"


@cache("plex:health", PlexHealthResponse, ttl=60)
async def retrieve_health(request: Request) -> PlexHealthResponse:
    """Retrieve Plex server health/identity information."""
    url = f"{get_plex_base_url()}/"

    try:
        response = requests.get(url, headers=PLEX_HEADERS)
        response.raise_for_status()
        data = response.json()

        media_container = data.get("MediaContainer", {})

        return PlexHealthResponse(
            friendly_name=media_container.get("friendlyName", "Unknown"),
            version=media_container.get("version", "Unknown"),
            platform=media_container.get("platform", "Unknown"),
            platform_version=media_container.get("platformVersion", "Unknown"),
            claimed=media_container.get("claimed", False),
            machine_identifier=media_container.get("machineIdentifier", "Unknown"),
        )
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect to Plex server: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to Plex server refused",
        )
    except requests.exceptions.HTTPError as e:
        logger.error(f"Plex API error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Plex API returned an error",
        )


@cache("plex:sessions", PlexSessionsResponse, ttl=15)
async def retrieve_sessions(request: Request) -> PlexSessionsResponse:
    """Retrieve currently active Plex sessions with user and media info."""
    url = f"{get_plex_base_url()}/status/sessions"

    try:
        response = requests.get(url, headers=PLEX_HEADERS)
        response.raise_for_status()
        data = response.json()

        media_container = data.get("MediaContainer", {})
        metadata_list = media_container.get("Metadata", [])

        sessions: list[PlexSession] = []

        for item in metadata_list:
            # Get user info
            user = item.get("User", {})
            username = user.get("title", "Unknown User")

            # Get player info
            player_data = item.get("Player", {})
            player = PlexPlayer(
                title=player_data.get("title", "Unknown Device"),
                platform=player_data.get("platform", "Unknown"),
                product=player_data.get("product", "Unknown"),
                state=player_data.get("state", "unknown"),
            )

            # Calculate progress
            duration = item.get("duration", 0)
            view_offset = item.get("viewOffset", 0)
            progress_percent = (view_offset / duration * 100) if duration > 0 else 0

            session = PlexSession(
                username=username,
                title=item.get("title", "Unknown"),
                media_type=item.get("type", "unknown"),
                grandparent_title=item.get("grandparentTitle"),
                parent_title=item.get("parentTitle"),
                year=item.get("year"),
                thumb=item.get("thumb"),
                player=player,
                progress_percent=round(progress_percent, 1),
                duration_ms=duration,
                view_offset_ms=view_offset,
            )
            sessions.append(session)

        return PlexSessionsResponse(
            count=len(sessions),
            sessions=sessions,
        )
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect to Plex server: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to Plex server refused",
        )
    except requests.exceptions.HTTPError as e:
        logger.error(f"Plex API error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Plex API returned an error",
        )


@cache("plex:library_counts", PlexLibraryCountsResponse, ttl=300)
async def retrieve_library_counts(request: Request) -> PlexLibraryCountsResponse:
    """Retrieve counts for all library sections."""
    url = f"{get_plex_base_url()}/library/sections"

    try:
        response = requests.get(url, headers=PLEX_HEADERS)
        response.raise_for_status()
        data = response.json()

        media_container = data.get("MediaContainer", {})
        directories = media_container.get("Directory", [])

        sections: list[PlexLibrarySection] = []
        total_items = 0

        for directory in directories:
            section_key = directory.get("key", "")
            section_title = directory.get("title", "Unknown")
            section_type = directory.get("type", "unknown")

            # Get the count for this section by querying it
            section_url = f"{get_plex_base_url()}/library/sections/{section_key}/all"
            section_response = requests.get(
                section_url,
                headers=PLEX_HEADERS,
                params={"X-Plex-Container-Start": 0, "X-Plex-Container-Size": 0},
            )
            section_response.raise_for_status()
            section_data = section_response.json()

            section_container = section_data.get("MediaContainer", {})
            count = section_container.get("totalSize", 0)

            sections.append(
                PlexLibrarySection(
                    key=section_key,
                    title=section_title,
                    type=section_type,
                    count=count,
                )
            )
            total_items += count

        return PlexLibraryCountsResponse(
            total_items=total_items,
            sections=sections,
        )
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect to Plex server: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to Plex server refused",
        )
    except requests.exceptions.HTTPError as e:
        logger.error(f"Plex API error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Plex API returned an error",
        )
