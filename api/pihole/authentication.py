import logging
from functools import wraps
import token
from typing import Annotated, Callable
from urllib.parse import urlencode

import requests
import urllib3
from fastapi import Depends, Request

from api.config import Settings
from api.nas.models import (
    SynoApiInfoResponse,
    SynoApiLoginResponse,
    SynoApiLogoutResponse,
    SynoApiVersions,
)
from api.utils.cache import cache

urllib3.disable_warnings(category=urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

def _pihole_login() -> str:
    url = f"{Settings.PIHOLE_API_BASE}/api/auth"
    logger.warning(url)
    data = {"password": Settings.PIHOLE_API_PASSWORD}
    r = requests.post(url, json=data, verify=False)
    r.raise_for_status()
    data = r.json()
    if "error" in data:
        raise Exception(f"Pi-hole login failed: {data['error']}")
    if "session" not in data:
        raise Exception("Pi-hole login failed: No session token returned")
    if data["session"].get("valid") != True or not data["session"].get("sid"):
        raise Exception("Pi-hole login failed: Unsuccessful status")
    logger.warning(f"Pi-hole login successful, SID: {data['session']['sid']}")
    return data["session"]["sid"]


def _pihole_logout(sid: str) -> None:
    url = f"{Settings.PIHOLE_API_BASE}/api/auth"
    headers = {
        "X-FTL-SID": sid
    }
    r = requests.delete(url, headers=headers, verify=False)
    r.raise_for_status()


def pihole_session(func: Callable) -> Callable:
    @wraps(func)
    async def wrapper(*args, **kwargs):
        sid = _pihole_login()
        try:
            result = await func(sid=sid, *args, **kwargs)
        finally:
            _pihole_logout(sid)
        return result
    return wrapper
