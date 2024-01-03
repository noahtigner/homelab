from contextlib import asynccontextmanager

import requests
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware

from api.diagnostics.retrieval import get_cpu_percent
from api.diagnostics.router import router as diagnostics_router
from api.docker.router import router as docker_router
from api.github.router import router as github_router
from api.leetcode.router import router as leetcode_router
from api.pihole.router import router as pihole_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    get_cpu_percent(None)  # first call will always return 0
    yield
    # cleanup


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
    {
        "name": "Pi-hole",
        "description": "Info for Pi-hole Ad Blocker",
    },
    {
        "name": "GitHub",
        "description": "GitHub Activity",
    },
    {
        "name": "LeetCode",
        "description": "LeetCode Stats",
    },
]

api = FastAPI(
    lifespan=lifespan,
    title="Homelab API",
    version="0.1.0",
    description="API for Homelab",
    openapi_tags=tags_metadata,
)

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
    "http://192.168.0.69:5173",
]

api.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api.include_router(docker_router)
api.include_router(diagnostics_router)
api.include_router(pihole_router)
api.include_router(leetcode_router)
api.include_router(github_router)


@api.get("/", tags=["Diagnostics", "Ping"])
def get_server_health(request: Request):
    return {"status": "ok", "root_path": request.scope.get("root_path")}


@api.get("/npm", tags=["Diagnostics", "Ping"])
def get_npm_dl():
    data = {}

    try:
        r1 = requests.get("https://registry.npmjs.org/validate-env-vars/latest")
        r1.raise_for_status()
        data = r1.json()
    except requests.exceptions.RequestException as err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch NPM package info: {err}",
        )

    try:
        r2 = requests.get(
            "https://api.npmjs.org/downloads/point/last-week/validate-env-vars"
        )
        r2.raise_for_status()
        data["downloads"] = r2.json().get("downloads")
    except requests.exceptions.RequestException:
        data["downloads"] = None

    return data
