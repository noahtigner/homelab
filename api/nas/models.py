from typing import Dict, Literal

from pydantic import AliasChoices, BaseModel, Field, validator


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


class SynoApiVersions(BaseModel):
    ds_auth_api_version: int
    ds_filestation_api_version: int
    ds_core_system_api_version: int
    ds_utilization_api_version: int


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


# class SynoVolumeStatus(BaseModel):
#     freespace: int
#     readonly: bool
#     totalspace: int

#     def __hash__(self):
#         return hash((self.freespace, self.readonly, self.totalspace))


# class SynoListShareAdditional(BaseModel):
#     time: SynoFileTime
#     volume_status: SynoVolumeStatus


# class SynoListShare(BaseModel):
#     name: str
#     path: str
#     isdir: bool
#     additional: SynoListShareAdditional


# class SynoListShareData(BaseModel):
#     shares: list[SynoListShare]
#     offset: int
#     total: int


# class SynoListShareResponse(BaseModel):
#     data: SynoListShareData
#     success: Literal[True]


class SynoListAdditional(BaseModel):
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


class SynoTaskStartData(BaseModel):
    taskid: str


class SynoTaskStartResponse(BaseModel):
    data: SynoTaskStartData


class SynoCompletedSizeTaskData(BaseModel):
    finished: Literal[True]
    num_dir: int
    num_file: int
    total_size: int


class SynoCompletedSizeTaskResponse(BaseModel):
    data: SynoCompletedSizeTaskData
    success: Literal[True]


# class SynoVolumesResponse(BaseModel):
#     volumes: list[SynoVolumeStatus]


class SynoFolderTimeData(BaseModel):
    last_accessed: int
    last_changed: int
    last_modified: int
    created: int


class SynoFolderFullInfo(BaseModel):
    name: str
    path: str
    is_dir: bool
    num_dir: int
    num_file: int
    total_size: int
    time: SynoFolderTimeData


class SynoFoldersResponse(BaseModel):
    folders: list[SynoFolderFullInfo]


class _SynoCorePciSlotInfo(BaseModel):
    Occupied: str
    Recognized: str
    cardName: str
    slot: str


class _SynoCoreSystemInfo(BaseModel):
    cpu_clock_speed: int
    cpu_cores: int
    cpu_family: str
    cpu_series: str
    cpu_vendor: str
    external_pci_slot_info: list[_SynoCorePciSlotInfo]
    firmware_date: str
    firmware_ver: str
    model: str
    ntp_server: str
    ram_size: int
    sys_temp: int
    temperature_warning: bool
    up_time: str


class SynoCoreSystemResponse(BaseModel):
    data: _SynoCoreSystemInfo
    success: Literal[True]


class _SynoHddInfo(BaseModel):
    capacity: int
    diskPath: str
    diskType: str
    diskno: str
    order: int
    overview_status: str
    status: str
    temp: int
    testing_type: str


class _SynoVolumeInfo(BaseModel):
    desc: str
    is_encrypted: bool
    name: str
    status: str
    total_size: int
    used_size: int


class _SynoStorageInfo(BaseModel):
    hdd_info: list[_SynoHddInfo]
    vol_info: list[_SynoVolumeInfo]


class SynoStorageResponse(BaseModel):
    data: _SynoStorageInfo
    success: Literal[True]


class _SynoNetworkNif(BaseModel):
    addr: str
    id: str
    speed: int
    status: str
    type: str
    use_dhcp: bool


class _SynoNetworkData(BaseModel):
    dns: str
    enabled_domain: bool
    enabled_samba: bool
    gateway: str
    hostname: str
    nif: list[_SynoNetworkNif]
    workgroup: str


class SynoNetworkResponse(BaseModel):
    data: _SynoNetworkData
    success: Literal[True]


class _SynoCpuUtilization(BaseModel):
    load_15_min_avg: int = Field(validation_alias=AliasChoices("15min_load", "load_15_min_avg"))
    load_5_min_avg: int = Field(validation_alias=AliasChoices("5min_load", "load_5_min_avg"))
    load_1_min_avg: int = Field(validation_alias=AliasChoices("1min_load", "load_1_min_avg"))


class _SynoMemoryUtilization(BaseModel):
    real_usage: int


class _SynoSystemUtilizationData(BaseModel):
    cpu: _SynoCpuUtilization
    memory: _SynoMemoryUtilization


class SynoResourceUtilizationResponse(BaseModel):
    data: _SynoSystemUtilizationData
    success: Literal[True]


class SynoSystemResponse(BaseModel):
    core: _SynoCoreSystemInfo
    storage: _SynoStorageInfo
    network: _SynoNetworkData
    utilization: _SynoSystemUtilizationData
