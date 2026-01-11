import logging

from fastapi import APIRouter, Request

from api.github.models import EventsResponseModel
from api.github.retrieval import retrieve_events

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/github",
    tags=["GitHub"],
)


@router.get("/events/", response_model=EventsResponseModel)
async def get_events(request: Request):
    return await retrieve_events(request)
