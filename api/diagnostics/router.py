from typing import Union
from fastapi import APIRouter

from api.diagnostics.retrieval import (
    get_cpu_usage,
    get_mem_usage,
    get_disk_usage,
    get_pids,
)
from api.diagnostics.models import DiagnosticsModel

router = APIRouter(
    prefix="/diagnostics",
    tags=["Diagnostics"],
)


@router.get("/", response_model=DiagnosticsModel)
def get_diagnostics(interval: Union[float, None] = None):
    return DiagnosticsModel(
        cpu=get_cpu_usage(interval),
        memory=get_mem_usage(),
        disk=get_disk_usage(),
        pids=get_pids(),
    )
