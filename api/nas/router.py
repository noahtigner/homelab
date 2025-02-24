import logging

from fastapi import APIRouter, Request

from api.nas.authentication import retrieve_api_versions
from api.nas.models import SynoApiVersions, SynoFoldersResponse, SynoSystemResponse
from api.nas.retrieval import retrieve_folders_info, retrieve_system_info

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/nas",
    tags=["NAS"],
)


@router.get("/", tags=["Ping"])
async def get_nas_health(request: Request):
    await retrieve_api_versions(request)
    return {"status": "ok"}


@router.get("/versions/", tags=["Ping"], response_model=SynoApiVersions)
async def get_nas_versions(request: Request):
    return await retrieve_api_versions(request)


@router.get("/system/", response_model=SynoSystemResponse)
async def get_nas_system_info(request: Request):
    return await retrieve_system_info(request)


@router.get("/folders/", response_model=SynoFoldersResponse)
async def get_nas_folders(request: Request, folder: str | None = "/media"):
    return await retrieve_folders_info(request, folder=folder)
