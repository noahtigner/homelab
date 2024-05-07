from typing import Union

from pydantic import BaseModel


class CPUModel(BaseModel):
    count: int
    percent: list[float]
    temp: Union[float, None] = None


class UsageModel(BaseModel):
    total: int
    used: int
    available: int
    percent: float


class DiagnosticsModel(BaseModel):
    cpu: CPUModel
    memory: UsageModel
    disk: UsageModel
    pids: list[int]
