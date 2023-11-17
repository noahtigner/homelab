from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .diagnostics import get_cpu_usage, get_mem_usage, get_disk_usage, get_pids

api = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
]

api.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
