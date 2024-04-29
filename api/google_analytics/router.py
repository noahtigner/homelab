import json
import logging

from fastapi import APIRouter, Request

from api.google_analytics.models import ActiveUsersPerDay
from api.google_analytics.retrieval import (
    get_active_users_per_day as active_users_per_day,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/a",
    tags=["Google Analytics"],
)


@router.get("/active_users/", response_model=ActiveUsersPerDay)
async def get_active_users_per_day(request: Request):
    # Try to get the result from cache
    cached_result = await request.app.state.redis.get("active_users_per_day")
    if cached_result is not None:
        logger.info("Cache hit")
        return ActiveUsersPerDay(**json.loads(cached_result))

    result = active_users_per_day()

    # Cache the result
    await request.app.state.redis.set(
        "active_users_per_day", result.model_dump_json(), ex=60 * 60  # 1 hour
    )

    return result
