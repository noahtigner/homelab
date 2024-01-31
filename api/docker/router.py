import json
import logging

from fastapi import APIRouter, Request

from api.docker.models import DockerStatsModel
from api.docker.retrieval import get_container_stats, is_container_running, ping_docker

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/docker",
    tags=["Docker"],
)


@router.get("/", tags=["Ping"])
def get_docker_health():
    status = ping_docker()
    return {"status": "ok" if status else "error"}


@router.get("/container/{container_name}/", tags=["Ping"])
def get_container_health(container_name: str):
    status = is_container_running(container_name)
    return {"status": "ok" if status else "error"}


@router.get("/stats/", response_model=DockerStatsModel)
async def get_docker_stats(request: Request):
    # Try to get the result from cache
    cached_result = await request.app.state.redis.get("docker-stats")
    if cached_result is not None:
        logger.info("Cache hit")
        return DockerStatsModel(**json.loads(cached_result))

    stats = get_container_stats()

    # Cache the results
    await request.app.state.redis.set("docker-stats", stats.model_dump_json())
    await request.app.state.redis.expire("docker-stats", 3600)  # 1 hour

    return stats
