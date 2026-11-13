import logging
import time

import requests
from fastapi import Request

from api.config import Settings
from api.pihole.authentication import pihole_session
from api.pihole.models import (
    PiholeBlockingResponse,
    PiholeFTLSummary,
    PiholeHistoryIncoming,
    PiholeHistoryResponse,
    PiholeRecentStats,
    PiholeRecentStatsResponse,
)
from api.utils.cache import cache

logger = logging.getLogger(__name__)


@cache("pihole:blocking", PiholeBlockingResponse, ttl=30)
@pihole_session
async def retrieve_blocking(request: Request, sid: str) -> PiholeBlockingResponse:
    params = {"sid": sid}
    url = f"{Settings.PIHOLE_API_BASE}/api/dns/blocking"
    r = requests.get(url, params=params, verify=False)
    r.raise_for_status()
    return PiholeBlockingResponse(**r.json())


@cache("pihole:recent", PiholeRecentStatsResponse, ttl=30)
@pihole_session
async def retrieve_recent_stats(
    request: Request, sid: str
) -> PiholeRecentStatsResponse:
    now = int(time.time())
    twenty_four_hours_ago = now - (24 * 60 * 60)

    # /api/stats/summary
    stats_params = {"from": twenty_four_hours_ago, "until": now, "sid": sid}
    stats_url = f"{Settings.PIHOLE_API_BASE}/api/stats/database/summary"
    stats_r = requests.get(stats_url, params=stats_params, verify=False)
    stats_r.raise_for_status()

    # /api/info/ftl
    ftl_params = {"sid": sid}
    ftl_url = f"{Settings.PIHOLE_API_BASE}/api/info/ftl"
    ftl_r = requests.get(ftl_url, params=ftl_params, verify=False)
    ftl_r.raise_for_status()
    ftl_data = ftl_r.json().get("ftl", {})

    stats_data = PiholeRecentStats(**stats_r.json())
    ftl_data = PiholeFTLSummary(
        gravity=ftl_data.get("database", {}).get("gravity"),
        qps=ftl_data.get("query_frequency"),
        uptime=ftl_data.get("uptime"),
        percent_mem=ftl_data.get("%mem"),
        percent_cpu=ftl_data.get("%cpu"),
    )

    data = PiholeRecentStatsResponse(**stats_data.model_dump(), **ftl_data.model_dump())
    return data


@cache("pihole:history", PiholeHistoryResponse, ttl=30)
@pihole_session
async def retrieve_history(request: Request, sid: str) -> PiholeHistoryResponse:
    now = int(time.time())
    window_start = now - 24 * 60 * 60
    response = requests.get(
        f"{Settings.PIHOLE_API_BASE}/api/history/database",
        params={"from": window_start, "until": now},
        headers={"X-FTL-SID": sid},
        verify=False,
        timeout=(5, 20),
    )
    response.raise_for_status()
    incoming = PiholeHistoryIncoming.model_validate(response.json())
    points = {point.timestamp: point for point in incoming.history}
    return PiholeHistoryResponse(
        history=[points[timestamp] for timestamp in sorted(points)],
        window_start=window_start,
        window_end=now,
        # Pi-hole's long-term database history uses ten-minute buckets.
        interval_seconds=600,
    )
