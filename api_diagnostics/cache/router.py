from typing import Optional

from fastapi import APIRouter, Body, Request

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


@router.get("/get/")
async def get_cache_keys(request: Request):
    keys = await request.app.state.redis.keys("*")
    return {"keys": keys}


@router.get("/get/{key}/")
async def get_cache_value(key: str, request: Request):
    value = await request.app.state.redis.get(key)
    return {"key": key, "value": value}


@router.post("/set/{key}/")
async def set_cache_value(
    request: Request, key: str, value: Optional[str] = Body(None)
):
    await request.app.state.redis.set(key, value)
    return {"key": key, "value": value}
