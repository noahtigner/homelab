import logging

from api.docker.retrieval import is_container_running, ping_docker
from fastapi import APIRouter

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
