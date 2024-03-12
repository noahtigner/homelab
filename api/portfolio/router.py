import json
import logging
from urllib.parse import quote

import requests
from fastapi import APIRouter, HTTPException, Request, status

from api.config import Settings

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"],
)


@router.get("/ogp/")
async def get_ogp_data(request: Request):
    ogp_app_id = Settings.OGP_IO_API_KEY

    site_url = "https://www.noahtigner.com/"
    encoded_url = quote(site_url, safe="")
    url = f"https://opengraph.io/api/1.1/site/{encoded_url}/?app_id={ogp_app_id}"

    # Try to get the result from cache
    cached_result = await request.app.state.redis.get(f"ogp:{site_url}")
    if cached_result is not None:
        logger.info("Cache hit")
        return json.loads(cached_result)

    try:
        r = requests.get(url)
        r.raise_for_status()
        raw_data = r.json()

        # Cache the results
        await request.app.state.redis.set(
            f"ogp:{site_url}", json.dumps(raw_data), ex=60 * 60
        )  # 1 hour

        return raw_data
    except requests.exceptions.ConnectionError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to Pi-hole Refused",
        )
    except requests.exceptions.HTTPError as e:
        logger.error(e)
        if (
            r.status_code == status.HTTP_403_FORBIDDEN
            and "Rate limit exceeded" in r.text
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Rate Limit Exceeded",
            )
