from urllib.parse import urlencode

import requests
from fastapi import Request

from api.config import Settings
from api.nas.authentication import nas_session
from api.nas.models import (
    SynoFoldersResponse,
    SynoListResponse,
    SynoListShareResponse,
    SynoVolumesResponse,
    SynoVolumeStatus,
)
from api.utils.cache import cache


def _get_list_share_info(
    sid: str, ds_filestation_api_version: int
) -> SynoListShareResponse:
    additional_fields = ["time", "volume_status"]
    additional_fields = [f'"{field}"' for field in additional_fields]
    params = {
        "api": "SYNO.FileStation.List",
        "version": ds_filestation_api_version,
        "method": "list_share",
        "additional": f'[{",".join(additional_fields)}]',
        "_sid": sid,
    }
    r = requests.get(f"{Settings.NAS_API_BASE}?{urlencode(params)}")
    r.raise_for_status()
    data = SynoListShareResponse(**r.json())
    return data


def _get_list_info(
    sid: str, ds_filestation_api_version: int, folder: str
) -> SynoListResponse:
    additional_fields = ["size", "time"]
    additional_fields = [f'"{field}"' for field in additional_fields]
    params = {
        "api": "SYNO.FileStation.List",
        "version": ds_filestation_api_version,
        "method": "list",
        "folder_path": f'"{folder}"',
        "additional": f'[{",".join(additional_fields)}]',
        "_sid": sid,
    }
    r = requests.get(f"{Settings.NAS_API_BASE}?{urlencode(params)}")
    r.raise_for_status()
    data = SynoListResponse(**r.json())
    return data


@cache("nas:volumes", SynoVolumesResponse, ttl=60 * 3)
@nas_session
async def get_volumes_info(
    request: Request, sid: str, ds_filestation_api_version: int
) -> SynoVolumesResponse:
    shares = _get_list_share_info(sid, ds_filestation_api_version).data.shares
    volumes: set[SynoVolumeStatus] = set(
        share.additional.volume_status for share in shares
    )
    return SynoVolumesResponse(volumes=list(volumes))


@cache("nas:folders", SynoFoldersResponse, ttl=60 * 3)
@nas_session
async def retrieve_folders_info(
    request: Request,
    sid: str,
    ds_filestation_api_version: int,
    folder: str | None = "/media",
) -> SynoFoldersResponse:
    folder_info = _get_list_info(sid, ds_filestation_api_version, folder)
    result = SynoFoldersResponse(
        folders=folder_info.data.files,
    )
    return result
