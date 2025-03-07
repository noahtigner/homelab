import logging
from functools import wraps
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


@cache("nas:versions", response_model=SynoApiVersions, ttl=60 * 60 * 24 * 7)
async def retrieve_api_versions(*args, **kwargs) -> SynoApiVersions:
    params = {
        "api": "SYNO.API.Info",
        "version": 1,
        "method": "query",
        "query": "SYNO.API.Auth,SYNO.FileStation.,SYNO.Core.System,SYNO.Core.System.Utilization",
    }

    r = requests.post(
        Settings.NAS_API_BASE,
        data=params,
        verify=False,
    )
    r.raise_for_status()

    ds_api_info = SynoApiInfoResponse(**r.json())
    results = SynoApiVersions(
        ds_auth_api_version=ds_api_info.data["SYNO.API.Auth"].maxVersion,
        ds_filestation_api_version=ds_api_info.data["SYNO.FileStation.List"].maxVersion,
        ds_core_system_api_version=ds_api_info.data["SYNO.Core.System"].maxVersion,
        ds_utilization_api_version=ds_api_info.data[
            "SYNO.Core.System.Utilization"
        ].maxVersion,
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
        "client": "browser",
        "enable_device_token": "no",
        "logintype": "local",
        "rememberme": 0,
        "session": "webui",
    }
    r = requests.get(f"{Settings.NAS_API_BASE}?{urlencode(params)})", verify=False)
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
    r = requests.get(f"{Settings.NAS_API_BASE}?{urlencode(params)}", verify=False)
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
                versions=versions,
                *args,
                **kwargs,
            )
        finally:
            _nas_logout(versions.ds_auth_api_version, sid)

    return wrapper


NasSessionDependency = Annotated[tuple[str, str], Depends(_nas_session)]
