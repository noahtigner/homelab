from pydantic import BaseModel


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
