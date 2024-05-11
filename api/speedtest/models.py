from pydantic import BaseModel


class ServerModel(BaseModel):
    url: str
    lat: str
    lon: str
    name: str
    country: str
    cc: str
    sponsor: str
    id: str
    host: str
    d: float
    latency: float


class ClientModel(BaseModel):
    ip: str
    lat: str
    lon: str
    isp: str
    isprating: str
    rating: str
    ispdlavg: str
    ispulavg: str
    loggedin: str
    country: str


class SpeedTestModel(BaseModel):
    download: float
    upload: float
    ping: float
    server: ServerModel
    timestamp: str
    bytes_sent: int
    bytes_received: int
    share: str | None
    client: ClientModel
