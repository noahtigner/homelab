from typing import Literal

from pydantic import BaseModel, Field, FiniteFloat, NonNegativeInt


class PiholeBlockingResponse(BaseModel):
    blocking: Literal["enabled", "disabled"]


class PiholeRecentStats(BaseModel):
    sum_queries: int
    sum_blocked: int
    percent_blocked: float
    total_clients: int


class PiholeFTLSummary(BaseModel):
    gravity: int
    qps: float
    uptime: float
    percent_mem: float
    percent_cpu: float


class PiholeRecentStatsResponse(PiholeRecentStats, PiholeFTLSummary):
    pass


class PiholeHistoryPoint(BaseModel):
    timestamp: FiniteFloat = Field(ge=0)
    total: NonNegativeInt
    blocked: NonNegativeInt


class PiholeHistoryIncoming(BaseModel):
    history: list[PiholeHistoryPoint]


class PiholeHistoryResponse(PiholeHistoryIncoming):
    window_start: int
    window_end: int
    interval_seconds: int = Field(default=600, gt=0)
