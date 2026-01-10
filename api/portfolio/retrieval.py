import logging
from urllib.parse import quote

import requests
from fastapi import HTTPException, Request, status

from api.config import Settings
from api.portfolio.models import OGPPreviewResponse
from api.utils.cache import cache

logger = logging.getLogger(__name__)


@cache("portfolio:ogp", OGPPreviewResponse, ttl=60 * 60 * 3)
async def retrieve_ogp_data(request: Request) -> OGPPreviewResponse:
    ogp_app_id = Settings.OGP_IO_API_KEY

    site_url = "https://www.noahtigner.com/"
    encoded_url = quote(site_url, safe="")
    url = f"https://opengraph.io/api/1.1/site/{encoded_url}/?app_id={ogp_app_id}"

    try:
        r = requests.get(url)
        r.raise_for_status()
        raw_data = r.json()

        return OGPPreviewResponse(**raw_data)
    except requests.exceptions.ConnectionError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to OpenGraph.io Refused",
        )
    except requests.exceptions.HTTPError as e:
        logger.error(e)
        if r.status_code == status.HTTP_403_FORBIDDEN and "Rate limit exceeded" in r.text:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Rate Limit Exceeded",
            )
        raise HTTPException(
            status_code=r.status_code,
            detail=f"OpenGraph.io API Error: {e}",
        )
