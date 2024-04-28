import logging

from fastapi import APIRouter

from api.google_analytics.models import ActiveUsersPerDay
from api.google_analytics.retrieval import (
    get_active_users_per_day as active_users_per_day,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/a",
    tags=["Google Analytics"],
)


@router.get("/active_users", response_model=ActiveUsersPerDay)
def get_active_users_per_day():
    result = active_users_per_day()
    return result
