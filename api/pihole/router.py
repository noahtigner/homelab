from typing import Union
import requests
from fastapi import APIRouter, HTTPException, Request, Response, status

from api.config import Settings

router = APIRouter(
    prefix='/pihole',
    tags=['Pi-hole'],
)

@router.get('/summary')
def get_pihole_summary(response: Response):
    token = Settings.PIHOLE_API_TOKEN
    url = f'{Settings.PIHOLE_API_BASE}?summaryRaw&auth={token}'

    try:
        r = requests.get(url)
        response.status_code = r.status_code
        return r.json()
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to Pi-hole Refused"
        )
