from asyncio import gather, sleep
from urllib.parse import urlencode

import requests
import urllib3
from fastapi import Request

from api.config import Settings
from api.nas.authentication import nas_session
from api.nas.models import (
    SynoApiVersions,
    SynoCompletedSizeTaskData,
    SynoCompletedSizeTaskResponse,
    SynoCoreSystemResponse,
    SynoFolderFullInfo,
    SynoFoldersResponse,
    SynoFolderTimeData,
    SynoListResponse,
    SynoNetworkResponse,
    SynoResourceUtilizationResponse,
    SynoStorageResponse,
    SynoSystemResponse,
    SynoTaskStartResponse,
)
from api.utils.cache import cache

urllib3.disable_warnings(category=urllib3.exceptions.InsecureRequestWarning)


def _get_list_info(
    sid: str, versions: SynoApiVersions, folder: str
) -> SynoListResponse:
    additional_fields = ["time"]
    additional_fields = [f'"{field}"' for field in additional_fields]
    params = {
        "api": "SYNO.FileStation.List",
        "version": versions.ds_filestation_api_version,
        "method": "list",
        "folder_path": f'"{folder}"',
        "additional": f'[{",".join(additional_fields)}]',
        "_sid": sid,
    }
    r = requests.get(f"{Settings.NAS_API_BASE}?{urlencode(params)}", verify=False)
    r.raise_for_status()
    data = SynoListResponse(**r.json())
    return data


def _start_folder_size_task(
    sid: str, versions: SynoApiVersions, folders: list[str]
) -> dict[str, str]:
    start_params = {
        "api": "SYNO.FileStation.DirSize",
        "version": versions.ds_filestation_api_version,
        "method": "start",
        "_sid": sid,
    }
    task_ids: dict[str, str] = {}
    for folder in folders:
        start_params["path"] = f'["{folder}"]'
        r = requests.get(
            f"{Settings.NAS_API_BASE}?{urlencode(start_params)}", verify=False
        )
        r.raise_for_status()
        task_ids[folder] = SynoTaskStartResponse(**r.json()).data.taskid
    return task_ids


async def _get_folder_size(
    sid: str, versions: SynoApiVersions, folder: str, task_id: str
) -> tuple[str, SynoCompletedSizeTaskData]:
    poll_pararms = {
        "api": "SYNO.FileStation.DirSize",
        "version": versions.ds_filestation_api_version,
        "method": "status",
        "taskid": f'"{task_id}"',
        "_sid": sid,
    }
    polling_retries: int = 0
    while polling_retries < 20:
        r = requests.get(
            f"{Settings.NAS_API_BASE}?{urlencode(poll_pararms)}", verify=False
        )
        r.raise_for_status()
        if r.json().get("data", {}).get("finished"):
            break
        polling_retries += 1
        await sleep(0.25 * (polling_retries + 1))
    else:
        raise ValueError("Failed to retrieve folder size information")
    data = SynoCompletedSizeTaskResponse(**r.json())
    return folder, data.data


def _stop_folder_size_task(sid: str, versions: SynoApiVersions, task_id: str) -> None:
    stop_params = {
        "api": "SYNO.FileStation.DirSize",
        "version": versions.ds_filestation_api_version,
        "method": "stop",
        "taskid": f'"{task_id}"',
        "_sid": sid,
    }
    r = requests.get(f"{Settings.NAS_API_BASE}?{urlencode(stop_params)}", verify=False)
    r.raise_for_status()


@cache("nas:folders", SynoFoldersResponse, ttl=60 * 3)
@nas_session
async def retrieve_folders_info(
    request: Request,
    sid: str,
    versions: SynoApiVersions,
    folder: str,
) -> SynoFoldersResponse:
    folder_info: SynoListResponse = _get_list_info(sid, versions, folder)

    # Start a folder size calculation task for each sub-folder
    sub_folder_paths = [file.path for file in folder_info.data.files if file.isdir]
    task_ids = _start_folder_size_task(sid, versions, sub_folder_paths)

    # Retrieve the folder size information for each sub-folder
    folder_size_info = await gather(
        *[
            _get_folder_size(sid, versions, sub_folder, task_id)
            for sub_folder, task_id in task_ids.items()
        ]
    )
    folder_size_info_dict = {folder: data for folder, data in folder_size_info}

    # Create the response data
    folder_data: list[SynoFolderFullInfo] = []
    for sub_folder_basic_info in folder_info.data.files:
        if not sub_folder_basic_info.isdir:
            continue
        sub_folder_size_info = folder_size_info_dict[sub_folder_basic_info.path]

        folder_data.append(
            SynoFolderFullInfo(
                name=sub_folder_basic_info.name,
                path=sub_folder_basic_info.path,
                is_dir=sub_folder_basic_info.isdir,
                num_dir=sub_folder_size_info.num_dir,
                num_file=sub_folder_size_info.num_file,
                total_size=sub_folder_size_info.total_size,
                time=SynoFolderTimeData(
                    last_accessed=sub_folder_basic_info.additional.time.atime,
                    last_changed=sub_folder_basic_info.additional.time.ctime,
                    last_modified=sub_folder_basic_info.additional.time.mtime,
                    created=sub_folder_basic_info.additional.time.crtime,
                ),
            )
        )
    results = SynoFoldersResponse(
        folders=folder_data,
    )

    # Stop the folder size calculation tasks
    for task_id in task_ids.values():
        _stop_folder_size_task(sid, versions, task_id)

    return results


@cache("nas:system", SynoSystemResponse, ttl=60 * 1)
@nas_session
async def retrieve_system_info(
    request: Request, sid: str, versions: SynoApiVersions
) -> SynoSystemResponse:
    base_params = {
        "version": f'"{versions.ds_core_system_api_version}"',
        "_sid": sid,
    }

    # Core System Info
    params = {
        **base_params,
        "api": "SYNO.Core.System",
        "method": "info",
    }
    r = requests.get(f"{Settings.NAS_API_BASE}?{urlencode(params)}", verify=False)
    r.raise_for_status()
    core_info = SynoCoreSystemResponse(**r.json())

    # Storage Info
    params = {
        **base_params,
        "api": "SYNO.Core.System",
        "method": "info",
        "type": "storage",
    }
    r = requests.get(f"{Settings.NAS_API_BASE}?{urlencode(params)}", verify=False)
    r.raise_for_status()
    storage_info = SynoStorageResponse(**r.json())

    # Network Info
    params = {
        **base_params,
        "api": "SYNO.Core.System",
        "method": "info",
        "type": "network",
    }
    r = requests.get(f"{Settings.NAS_API_BASE}?{urlencode(params)}", verify=False)
    r.raise_for_status()
    network_info = SynoNetworkResponse(**r.json())

    # Resource Utilization Info
    params = {
        **base_params,
        "version": f'"{versions.ds_utilization_api_version}"',
        "api": "SYNO.Core.System.Utilization",
        "method": "get",
    }
    r = requests.get(f"{Settings.NAS_API_BASE}?{urlencode(params)}", verify=False)
    r.raise_for_status()
    utilization_info = SynoResourceUtilizationResponse(**r.json())

    return SynoSystemResponse(
        core=core_info.data,
        storage=storage_info.data,
        network=network_info.data,
        utilization=utilization_info.data,
    )
