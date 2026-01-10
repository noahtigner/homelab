import logging

import requests
from fastapi import APIRouter, HTTPException, Request, status

from api.pihole.models import PiholeRecentStatsResponse
from api.pihole.retrieval import retrieve_blocking, retrieve_recent_stats

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/pihole",
    tags=["Pi-hole"],
)


@router.get("/", tags=["Ping"])
async def get_pihole_health(request: Request):
    try:
        blocking_response = await retrieve_blocking(request)

        enabled = blocking_response.blocking == "enabled"
        service_status = "ok" if enabled else "warning"

        return {"status": service_status}
    except requests.exceptions.ConnectionError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to Pi-hole Refused",
        )


@router.get("/summary/", response_model=PiholeRecentStatsResponse)
async def get_pihole_summary(request: Request):
    try:
        return await retrieve_recent_stats(request)
    except Exception as e:
        logger.error(f"Error retrieving Pi-hole summary: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
