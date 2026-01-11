import logging

import requests
from fastapi import HTTPException, Request, status

from api.npm.models import NPMDownloads, NPMDownloadsDay, NPMPackageInfo
from api.utils.cache import cache

logger = logging.getLogger(__name__)


@cache("npm:package", NPMPackageInfo, ttl=60 * 60)
async def retrieve_package_info(request: Request, package_name: str) -> NPMPackageInfo:
    try:
        url = f"https://registry.npmjs.org/{package_name}/latest"
        r = requests.get(url)
        r.raise_for_status()
        raw_data = r.json()
        response_data = NPMPackageInfo(
            name=raw_data["name"],
            version=raw_data["version"],
            description=raw_data["description"],
            license=raw_data["license"],
            homepage=raw_data["homepage"],
            repository=raw_data["repository"]["url"],
            issues=raw_data["bugs"]["url"],
            pulls=raw_data["bugs"]["url"].replace("issues", "pulls"),
            downloads=NPMDownloads(
                total=None,
                per_day=[],
                start=None,
                end=None,
            ),
        )
    except requests.exceptions.ConnectionError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to NPM API Refused",
        )

    try:
        url = f"https://api.npmjs.org/downloads/point/last-month/{package_name}"
        r = requests.get(url)
        raw_data = r.json()
        response_data.downloads.total = raw_data["downloads"]
    except requests.exceptions.RequestException:
        logger.error("Failed to fetch NPM package downloads")

    try:
        url = f"https://api.npmjs.org/downloads/range/last-month/{package_name}"
        r = requests.get(url)
        raw_data = r.json()
        response_data.downloads.start = raw_data["start"]
        response_data.downloads.end = raw_data["end"]
        response_data.downloads.per_day = [
            NPMDownloadsDay(
                downloads=day["downloads"],
                day=day["day"],
            )
            for day in raw_data["downloads"]
        ]
    except requests.exceptions.RequestException:
        logger.error("Failed to fetch NPM package downloads per day")

    return response_data
