import json
import logging

from fastapi import APIRouter, HTTPException, Request, status

from api.speedtest.models import SpeedTestModel

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/speedtest",
    tags=["Speed Test"],
)


@router.get("/", response_model=SpeedTestModel)
async def get_speedtest_data(request: Request):
    # Try to get the result from cache
    cached_result = await request.app.state.redis.get("speedtest")
    if cached_result is not None:
        logger.info("Cache hit")
        return SpeedTestModel(**json.loads(cached_result))

    # return an error
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="SpeedTest data not cached",
    )
