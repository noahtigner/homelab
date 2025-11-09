import logging
from contextlib import asynccontextmanager
from itertools import product

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from api.config import Settings
from api.diagnostics.retrieval import get_cpu_percent
from api.diagnostics.router import router as diagnostics_router
from api.docker.router import router as docker_router

logging.basicConfig(
    level=logging.INFO, format="%(levelname)s\t%(funcName)s.%(lineno)d\t%(message)s"
)
logger = logging.getLogger(__name__)


tags_metadata = [
    {
        "name": "Ping",
        "description": "Service Health Checks",
    },
    {
        "name": "Diagnostics",
        "description": "Host Diagnostics",
    },
    {
        "name": "Docker",
        "description": "Docker Stats",
    },
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    get_cpu_percent(None)  # first call will always return 0
    yield
    # cleanup


api = FastAPI(
    lifespan=lifespan,
    title="Homelab API",
    version="0.1.0",
    description="API for Homelab",
    openapi_tags=tags_metadata,
)

ips = [
    "localhost",
    "127.0.0.1",
    Settings.SERVER_IP,
]

ports = ["8080", "5173"]

protocols = [
    "",
    "http://",
    "https://",
]

# Generate all combinations of ips, ports, and protocols
combinations = product(ips, ports, protocols)

# Create origins from combinations
origins = [f"{protocol}{ip}:{port}" for ip, port, protocol in combinations]

api.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api.include_router(docker_router)
api.include_router(diagnostics_router)


@api.get("/", tags=["Diagnostics", "Ping"])
def get_server_health(request: Request):
    return {"status": "ok", "root_path": request.scope.get("root_path")}
