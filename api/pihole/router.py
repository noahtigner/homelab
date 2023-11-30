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
    url1 = f'{Settings.PIHOLE_API_BASE}?summaryRaw&auth={token}'
    url2 = f'{Settings.PIHOLE_API_BASE}/api_db.php?messages&auth={token}'

    try:
        r1 = requests.get(url1)
        r2 = requests.get(url2)

        if r1.status_code != 200 or r2.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Connection to Pi-hole Refused"
            )
        
        enabled = r1.json().get('status') == 'enabled'
        messages = r2.json().get('messages')
        service_status = "ok" if enabled and len(messages) == 0 else "warning"

        return {"status": service_status, "messages": messages}
    except requests.exceptions.ConnectionError as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to Pi-hole Refused"
        )

@router.get('/summary')
def get_pihole_summary(response: Response):
    token = Settings.PIHOLE_API_TOKEN
    url = f'{Settings.PIHOLE_API_BASE}/api.php?summaryRaw&auth={token}'

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
