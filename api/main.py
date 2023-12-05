from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware

from api.config import Settings
from api.diagnostics.retrieval import get_cpu_percent
from api.diagnostics.router import router as diagnostics_router
from api.pihole.router import router as pihole_router
from api.docker.router import router as docker_router
from api.leetcode.router import router as leetcode_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    #startup
    get_cpu_percent() # first call will always return 0
    yield
    #cleanup

api = FastAPI(
    lifespan=lifespan,
    title="Homelab API",
    version="0.1.0",
    description="API for Homelab",
    tags=["homelab"],
)

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
    'http://192.168.0.69:5173'
]

api.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api.include_router(diagnostics_router)
api.include_router(pihole_router)
api.include_router(docker_router)
api.include_router(leetcode_router)

@api.get("/")
@api.get("/ping")
def get_health(request: Request):
    return {"status": "ok", "root_path": request.scope.get("root_path")}

# example
@api.get('/params/{item_id}')
def get_params(item_id: str):
    return {"item_id": item_id}

