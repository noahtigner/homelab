from fastapi import APIRouter, Request
from redis.exceptions import ConnectionError

router = APIRouter(
    prefix="/cache",
    tags=["Cache"],
)


@router.get("/", tags=["Ping"])
async def get_cache_health(request: Request):
    try:
        status = await request.app.state.redis.ping()
    except (ConnectionError, ConnectionRefusedError):
        status = False
    return {"status": "ok" if status else "error"}
