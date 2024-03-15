import logging
from contextlib import asynccontextmanager

import redis.asyncio as redis
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from api.cache.router import router as cache_router
from api.diagnostics.retrieval import get_cpu_percent
from api.diagnostics.router import router as diagnostics_router
from api.docker.router import router as docker_router
from api.github.router import router as github_router
from api.leetcode.router import router as leetcode_router
from api.npm.router import router as npm_router
from api.pihole.router import router as pihole_router
from api.portfolio.router import router as portfolio_router
from api.monarchmoney.router import router as monarchmoney_router

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
    {
        "name": "Pi-hole",
        "description": "Info for Pi-hole Ad Blocker",
    },
    {
        "name": "Cache",
        "description": "Redis Cache Stats",
    },
    {
        "name": "GitHub",
        "description": "GitHub Activity",
    },
    {
        "name": "LeetCode",
        "description": "LeetCode Stats",
    },
    {
        "name": "NPM",
        "description": "NPM Package Stats",
    },
    {
        "name": "Portfolio",
        "description": "Portfolio Site Stats",
    },
    {
        "name": "Monarch Money",
        "description": "Monarch Money Data",
    },
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    get_cpu_percent(None)  # first call will always return 0
    # set up redis cache
    app.state.redis = redis.Redis(host="cache", port=6379, db=0)
    logger.info(f"Ping successful: {await app.state.redis.ping()}")
    yield
    # cleanup
    await app.state.redis.close()


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
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5173/",
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
api.include_router(npm_router)
api.include_router(cache_router)
api.include_router(portfolio_router)
api.include_router(monarchmoney_router)


@api.get("/", tags=["Diagnostics", "Ping"])
def get_server_health(request: Request):
    return {"status": "ok", "root_path": request.scope.get("root_path")}
