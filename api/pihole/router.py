from typing import Union
import requests
from fastapi import APIRouter, HTTPException, Response, status

from api.config import Settings

router = APIRouter(
    prefix='/pihole',
    tags=['Pi-hole'],
)

@router.get('/')
@router.get('/ping')
def get_pihole_health(response: Response):
    token = Settings.PIHOLE_API_TOKEN
    url = f'{Settings.PIHOLE_API_BASE}?summaryRaw&messages&auth={token}'

    try:
        r = requests.get(url)
        response.status_code = r.status_code
        response_data = r.json()
        return {
            "status": "ok" if response_data['status'] == 'enabled' else 'error',
            "messages": response_data['messages']
        }
    except requests.exceptions.ConnectionError as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to Pi-hole Refused"
        )

@router.get('/summary')
def get_pihole_summary(response: Response):
    token = Settings.PIHOLE_API_TOKEN
    url = f'{Settings.PIHOLE_API_BASE}?summaryRaw&auth={token}'

    try:
        r = requests.get(url)
        response.status_code = r.status_code
        return r.json()
    except requests.exceptions.ConnectionError as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to Pi-hole Refused"
        )

# http://192.168.0.69/admin/api.php?topItems
# http://192.168.0.69/admin/api.php?getQuerySources&topClientsBlocked
# http://192.168.0.69/admin/api.php?overTimeDataClients&getClientNames
# http://192.168.0.69/admin/api.php?overTimeData10mins
