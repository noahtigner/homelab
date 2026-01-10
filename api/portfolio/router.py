import logging

from fastapi import APIRouter, Request

from api.portfolio.models import OGPPreviewResponse
from api.portfolio.retrieval import retrieve_ogp_data

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"],
)


@router.get("/ogp/", response_model=OGPPreviewResponse)
async def get_ogp_data(request: Request):
    return await retrieve_ogp_data(request)
