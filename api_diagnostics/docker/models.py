from pydantic import BaseModel


class DockerContainerStatsModel(BaseModel):
    id: str
    name: str
    cpu_usage: int
    memory_usage: int
    memory_limit: int
    network_in: int
    network_out: int
    network_dropped: int
    block_in: int
    block_out: int
    pids: int


class DockerStatsModel(BaseModel):
    containers: list[DockerContainerStatsModel]
    system_cpu_usage: int
