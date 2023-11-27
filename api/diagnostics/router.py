from typing import Union
from fastapi import APIRouter, Depends, HTTPException

from api.diagnostics.retrieval import get_cpu_percent, get_cpu_usage, get_mem_usage, get_disk_usage, get_pids

router = APIRouter(
    prefix='/diagnostics',
    tags=['Diagnostics'],
)

@router.get("/")
def get_diagnostics(interval: Union[float, None] = None):
    return {
        "diagnostics": {
            "cpu": get_cpu_usage(interval),
            "memory": get_mem_usage(),
            "disk": get_disk_usage(),
            "pids": get_pids(),
        },
    }
