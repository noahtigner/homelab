import logging

from fastapi import APIRouter, Request

from api.plex.models import (
    PlexHealthResponse,
    PlexLibraryCountsResponse,
    PlexSessionsResponse,
)
from api.plex.retrieval import (
    retrieve_health,
    retrieve_library_counts,
    retrieve_sessions,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/plex",
    tags=["Plex"],
)


@router.get("/", response_model=PlexHealthResponse, tags=["Ping"])
async def get_plex_health(request: Request):
    """Get Plex server health and status information."""
    return await retrieve_health(request)


@router.get("/sessions/", response_model=PlexSessionsResponse)
async def get_plex_sessions(request: Request):
    """Get currently active Plex sessions with users and what they're watching."""
    return await retrieve_sessions(request)


@router.get("/library/counts/", response_model=PlexLibraryCountsResponse)
async def get_plex_library_counts(request: Request):
    """Get item counts for all Plex library sections."""
    return await retrieve_library_counts(request)
