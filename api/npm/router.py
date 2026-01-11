import logging

from fastapi import APIRouter, Request

from api.npm.models import NPMPackageInfo
from api.npm.retrieval import retrieve_package_info

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/npm",
    tags=["NPM"],
)


@router.get("/{package_name}/", response_model=NPMPackageInfo)
async def get_package_stats(request: Request, package_name: str):
    return await retrieve_package_info(request, package_name=package_name)
