import requests
from fastapi import APIRouter, HTTPException, Response, status

from api.npm.models import NPMDownloads, NPMDownloadsDay, NPMPackageInfo

router = APIRouter(
    prefix="/npm",
    tags=["NPM"],
)


@router.get("/{package_name}/", response_model=NPMPackageInfo)
def get_problems_solved(package_name: str, response: Response):
    try:
        url = f"https://registry.npmjs.org/{package_name}/latest"
        r = requests.get(url)
        response.status_code = r.status_code
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
        print(e)
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
        print("Failed to fetch NPM package downloads")

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
        print("Failed to fetch NPM package downloads per day")

    return response_data
