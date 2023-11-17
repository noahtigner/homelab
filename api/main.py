from fastapi import FastAPI

from .diagnostics import get_cpu_usage, get_mem_usage, get_disk_usage, get_pids

api = FastAPI()

@api.get("/")
def ping():
    return {"status": "ok"}


@api.get("/api/diagnostics")
def diagnostics(interval: float = 0.5):
    return {
        "diagnostics": {
            "cpu": get_cpu_usage(interval),
            "memory": get_mem_usage(),
            "disk": get_disk_usage(),
            "pids": get_pids(),
        },
    }

@api.get('/api/params/{item_id}')
def get_params(item_id: str):
    return {"item_id": item_id}
