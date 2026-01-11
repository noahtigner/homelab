import json
import logging

from fastapi import HTTPException, Request, status

from api.speedtest.models import SpeedTestModel

logger = logging.getLogger(__name__)


async def retrieve_speedtest_data(request: Request) -> SpeedTestModel:
    """Retrieve the latest speedtest data from cache.

    Note: This endpoint only reads from cache. The speedtest data is populated
    by an external service that runs periodic speed tests.
    """
    cached_result = await request.app.state.redis.get("speedtest")
    if cached_result is not None:
        logger.info("Cache hit")
        return SpeedTestModel(**json.loads(cached_result))

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="SpeedTest data not cached",
    )
