import logging
from functools import wraps
from typing import Annotated, Callable
from urllib.parse import urlencode

import requests
from fastapi import Depends, Request

from api.config import Settings
from api.nas.models import (
    GetApiVersionsResponse,
    SynoApiInfoResponse,
    SynoApiLoginResponse,
    SynoApiLogoutResponse,
)
from api.utils.cache import cache

logger = logging.getLogger(__name__)


@cache("nas:versions", response_model=GetApiVersionsResponse, ttl=60 * 60 * 24 * 7)
async def retrieve_api_versions(*args, **kwargs) -> GetApiVersionsResponse:
    params = {
        "api": "SYNO.API.Info",
        "version": 1,
        "method": "query",
        "query": "SYNO.API.Auth,SYNO.FileStation.",
    }
    r = requests.get(f"{Settings.NAS_API_BASE}?{urlencode(params)}")
    r.raise_for_status()
    ds_api_info = SynoApiInfoResponse(**r.json())
    results = GetApiVersionsResponse(
        ds_auth_api_version=ds_api_info.data["SYNO.API.Auth"].maxVersion,
        ds_filestation_api_version=ds_api_info.data["SYNO.FileStation.List"].maxVersion,
    )
    return results


def _nas_login(ds_auth_api_version: str) -> str:
    params = {
        "api": "SYNO.API.Auth",
        "version": ds_auth_api_version,
        "method": "login",
        "account": Settings.NAS_API_USERNAME,
        "passwd": Settings.NAS_API_PASSWORD,
        "format": "sid",
    }
    r = requests.get(f"{Settings.NAS_API_BASE}?{urlencode(params)})")
    r.raise_for_status()
    data = SynoApiLoginResponse(**r.json())
    return data.data.sid


def _nas_logout(ds_auth_api_version: str, sid: str) -> None:
    params = {
        "api": "SYNO.API.Auth",
        "version": ds_auth_api_version,
        "method": "logout",
        "sid": sid,
    }
    r = requests.get(f"{Settings.NAS_API_BASE}?{urlencode(params)}")
    r.raise_for_status()
    SynoApiLogoutResponse(**r.json())


async def _nas_session(request: Request):
    versions = await retrieve_api_versions(request)
    sid = _nas_login(versions.ds_auth_api_version)
    try:
        yield sid, versions.ds_filestation_api_version
    finally:
        _nas_logout(versions.ds_auth_api_version, sid)


def nas_session(func: Callable) -> Callable:
    @wraps(func)
    async def wrapper(request: Request, *args, **kwargs):
        versions = await retrieve_api_versions(request)
        sid = _nas_login(versions.ds_auth_api_version)
        try:
            return await func(
                request=request,
                sid=sid,
                ds_filestation_api_version=versions.ds_filestation_api_version,
                *args,
                **kwargs,
            )
        finally:
            _nas_logout(versions.ds_auth_api_version, sid)

    return wrapper


NasSessionDependency = Annotated[tuple[str, str], Depends(_nas_session)]
