import logging
from sqlite3 import Error as SQLiteError

from fastapi import APIRouter, HTTPException, Request

from api.leetcode.activity import (
    ActivityError,
    activity_store,
    configured,
    read_activity,
)
from api.leetcode.activity_models import ActivityCalendar
from api.leetcode.models import (
    LCLanguagesResponse,
    LCProblemsSolvedModel,
    LCTopicsSolvedModel,
)
from api.leetcode.retrieval import (
    retrieve_languages,
    retrieve_problems_solved,
    retrieve_topics,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/leetcode",
    tags=["LeetCode"],
)


@router.get("/solved/", response_model=LCProblemsSolvedModel)
async def get_problems_solved(request: Request):
    return await retrieve_problems_solved(request)


@router.get("/languages/", response_model=LCLanguagesResponse)
async def get_problems_solved_per_language(request: Request):
    return await retrieve_languages(request)


@router.get("/topics/", response_model=LCTopicsSolvedModel)
async def get_problems_solved_per_topic(request: Request):
    return await retrieve_topics(request)


def require_activity_configuration():
    if not configured():
        raise HTTPException(
            503,
            "Set LEETCODE_SESSION and LEETCODE_CSRF_TOKEN on the API to enable difficulty history.",
        )


@router.get("/calendar/", response_model=ActivityCalendar)
def get_activity_calendar():
    require_activity_configuration()
    try:
        return read_activity()
    except ActivityError as error:
        raise HTTPException(503, str(error)) from None
    except OSError, SQLiteError:
        raise HTTPException(
            503, "LeetCode activity storage is unavailable. Check the API data volume."
        ) from None


@router.post("/calendar/sync/")
def refresh_activity_calendar():
    require_activity_configuration()
    try:
        activity_store().schedule()
    except OSError, SQLiteError:
        raise HTTPException(
            503, "LeetCode activity storage is unavailable. Check the API data volume."
        ) from None
    return {"status": "scheduled"}
