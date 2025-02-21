import logging

from fastapi import APIRouter, Request

from api.nas.authentication import retrieve_api_versions
from api.nas.retrieval import get_volumes_info, retrieve_folders_info

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/nas",
    tags=["NAS"],
)


@router.get("/", tags=["Ping"])
async def get_nas_health(request: Request):
    await retrieve_api_versions(request)
    return {"status": "ok"}


@router.get("/volumes/")
async def get_nas_volumes(request: Request):
    return await get_volumes_info(request)


@router.get("/folders/")
async def get_nas_folders(request: Request, folder: str | None = "/media"):
    return await retrieve_folders_info(request, folder=folder)
