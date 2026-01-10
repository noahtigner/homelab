import logging

from fastapi import APIRouter, Request

from api.speedtest.models import SpeedTestModel
from api.speedtest.retrieval import retrieve_speedtest_data

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/speedtest",
    tags=["Speed Test"],
)


@router.get("/", response_model=SpeedTestModel)
async def get_speedtest_data(request: Request):
    return await retrieve_speedtest_data(request)
