from fastapi import APIRouter

from api.docker.models import DockerStatsModel
from api.docker.retrieval import get_container_stats, is_container_running, ping_docker

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
def get_docker_stats():
    return get_container_stats()
