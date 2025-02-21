from typing import Dict, Literal

from pydantic import BaseModel, validator


class SynoApiInfo(BaseModel):
    path: str
    minVersion: int
    maxVersion: int


class SynoApiInfoResponse(BaseModel):
    data: Dict[str, SynoApiInfo]
    success: Literal[True]

    @validator("data", pre=True)
    def check_required_keys(cls, v):
        required_keys = {"SYNO.FileStation.List", "SYNO.API.Auth"}
        if not required_keys.issubset(v.keys()):
            missing_keys = required_keys - v.keys()
            raise ValueError(f"Missing required keys: {missing_keys}")
        return v


class GetApiVersionsResponse(BaseModel):
    ds_auth_api_version: int
    ds_filestation_api_version: int


class SynoApiLoginData(BaseModel):
    account: str
    device_id: str
    is_portal_port: bool
    sid: str
    synotoken: str | None = None


class SynoApiLoginResponse(BaseModel):
    data: SynoApiLoginData
    success: Literal[True]


class SynoApiLogoutResponse(BaseModel):
    success: Literal[True]


class SynoFileTime(BaseModel):
    atime: int
    ctime: int
    mtime: int
    crtime: int


class SynoVolumeStatus(BaseModel):
    freespace: int
    readonly: bool
    totalspace: int

    def __hash__(self):
        return hash((self.freespace, self.readonly, self.totalspace))


class SynoListShareAdditional(BaseModel):
    time: SynoFileTime
    volume_status: SynoVolumeStatus


class SynoListShare(BaseModel):
    name: str
    path: str
    isdir: bool
    additional: SynoListShareAdditional


class SynoListShareData(BaseModel):
    shares: list[SynoListShare]
    offset: int
    total: int


class SynoListShareResponse(BaseModel):
    data: SynoListShareData
    success: Literal[True]


class SynoListAdditional(BaseModel):
    size: int
    time: SynoFileTime


class SynoFile(BaseModel):
    name: str
    path: str
    isdir: bool
    additional: SynoListAdditional


class SynoListData(BaseModel):
    files: list[SynoFile]
    offset: int
    total: int


class SynoListResponse(BaseModel):
    data: SynoListData
    success: Literal[True]


class SynoVolumesResponse(BaseModel):
    volumes: list[SynoVolumeStatus]


class SynoFoldersResponse(BaseModel):
    folders: list[SynoFile]
