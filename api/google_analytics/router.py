import logging

from fastapi import APIRouter, Request

from api.google_analytics.models import ActiveUsersPerDay
from api.google_analytics.retrieval import retrieve_active_users_per_day

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/a",
    tags=["Google Analytics"],
)


@router.get("/active_users/", response_model=ActiveUsersPerDay)
async def get_active_users_per_day(request: Request):
    return await retrieve_active_users_per_day(request)
