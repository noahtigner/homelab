from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
import requests
from typing import Union

from .config import Settings
from .diagnostics import get_cpu_percent, get_cpu_usage, get_mem_usage, get_disk_usage, get_pids

@asynccontextmanager
async def lifespan(app: FastAPI):
    #startup
    get_cpu_percent() # first call will always return 0
    yield
    #cleanup

api = FastAPI(lifespan=lifespan)

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
@api.get("/ping")
def ping(request: Request):
    return {"status": "ok", "root_path": request.scope.get("root_path")}

@api.get("/diagnostics")
def diagnostics(interval: Union[float, None] = None):
    return {
        "diagnostics": {
            "cpu": get_cpu_usage(interval),
            "memory": get_mem_usage(),
            "disk": get_disk_usage(),
            "pids": get_pids(),
        },
    }

@api.get('/pihole/summary')
def get_pihole_summary(response: Response):
    token = Settings.PIHOLE_API_TOKEN
    url = f'{Settings.PIHOLE_API_BASE}?summaryRaw&auth={token}'

    try:
        r = requests.get(url)
        response.status_code = r.status_code
        return r.json()
    except requests.exceptions.ConnectionError as e:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"error": "Connection to Pi-hole Refused"}

# example
@api.get('/params/{item_id}')
def get_params(item_id: str):
    return {"item_id": item_id}

