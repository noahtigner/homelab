import json
import logging
import subprocess
import time

import redis
from pydantic import BaseModel

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


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


def speedtest() -> SpeedTestModel:
    result = subprocess.run(["speedtest", "--json"], capture_output=True, text=True)

    if result.stderr:
        raise Exception(result.stderr)

    json_data = json.loads(result.stdout)
    return SpeedTestModel(**json_data)


def main(interval: int) -> None:
    logger.info("Starting up...")
    cache = redis.Redis(host="cache", port=6379, db=0)

    while True:
        logger.info("Running speedtest...")

        try:
            # run the speedtest
            result = speedtest().model_dump_json()

            # log the results
            logger.info(result)

            # cache the results
            cache.set("speedtest", result, ex=interval * 2)

            time.sleep(interval)

        except Exception as e:
            logger.error(e)
            time.sleep(30)


if __name__ == "__main__":
    main(interval=60 * 10)  # roughly every 10 minutes
