import logging
from datetime import UTC, datetime
from zoneinfo import ZoneInfoNotFoundError

from fastapi import APIRouter, HTTPException, Request

from api.config import Settings
from api.github.models import ContributionCalendarModel, EventsResponseModel
from api.github.retrieval import retrieve_contributions, retrieve_events
from api.utils.calendar import activity_calendar_window

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/github",
    tags=["GitHub"],
)


@router.get("/events/", response_model=EventsResponseModel)
async def get_events(request: Request):
    return await retrieve_events(request)


@router.get("/contributions/", response_model=ContributionCalendarModel)
async def get_contributions(request: Request):
    try:
        _, _, end, _ = activity_calendar_window(
            datetime.now(UTC), Settings.ACTIVITY_TIMEZONE
        )
    except ZoneInfoNotFoundError:
        raise HTTPException(
            503, "Set GENERIC_TIMEZONE to a valid IANA timezone on the API."
        ) from None
    return await retrieve_contributions(
        request,
        username=Settings.GITHUB_USERNAME,
        as_of=end.isoformat(),
    )
