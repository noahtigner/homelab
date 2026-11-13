import json
from unittest.mock import AsyncMock, MagicMock

import pytest
import requests
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import ValidationError

from api.config import Settings
from api.pihole.retrieval import retrieve_history
from api.pihole.router import router


@pytest.fixture
def history_request(mocker):
    request = MagicMock()
    request.app.state.redis = AsyncMock()
    request.app.state.redis.get.return_value = None
    mocker.patch("api.pihole.authentication._pihole_login", return_value="test-sid")
    mocker.patch("api.pihole.authentication._pihole_logout")
    mocker.patch("api.pihole.retrieval.time.time", return_value=1_800_000_000)
    return request


def make_response(payload, code=200):
    response = requests.Response()
    response.status_code = code
    response._content = json.dumps(payload).encode()
    return response


@pytest.mark.asyncio
async def test_history_bounds_authentication_and_native_buckets(
    mocker, history_request
):
    first = {"timestamp": 1_799_914_000, "total": 0, "blocked": 0}
    last = {"timestamp": 1_799_999_800, "total": 20, "blocked": 5}
    get = mocker.patch(
        "api.pihole.retrieval.requests.get",
        return_value=make_response({"history": [last, first, last], "took": 0.01}),
    )

    result = await retrieve_history(history_request)

    get.assert_called_once_with(
        f"{Settings.PIHOLE_API_BASE}/api/history/database",
        params={"from": 1_799_913_600, "until": 1_800_000_000},
        headers={"X-FTL-SID": "test-sid"},
        verify=False,
        timeout=(5, 20),
    )
    assert result.model_dump() == {
        "history": [first, last],
        "window_start": 1_799_913_600,
        "window_end": 1_800_000_000,
        "interval_seconds": 600,
    }
    history_request.app.state.redis.set.assert_awaited_once()
    assert history_request.app.state.redis.set.call_args.kwargs["ex"] == 30


@pytest.mark.asyncio
async def test_history_cache_hit_skips_upstream_and_authentication(
    mocker, history_request
):
    redis = history_request.app.state.redis
    cached = {}

    async def set_cached(key, value, ex):
        cached[key] = value

    redis.get.side_effect = cached.get
    redis.set.side_effect = set_cached
    get = mocker.patch(
        "api.pihole.retrieval.requests.get",
        return_value=make_response({"history": []}),
    )
    login = mocker.patch(
        "api.pihole.authentication._pihole_login", return_value="test-sid"
    )
    logout = mocker.patch("api.pihole.authentication._pihole_logout")

    first = await retrieve_history(history_request)
    second = await retrieve_history(history_request)

    assert first == second
    assert second.history == []
    get.assert_called_once()
    login.assert_called_once()
    logout.assert_called_once_with("test-sid")


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"history": None},
        {"history": [{"timestamp": "bad", "total": 10, "blocked": 1}]},
        {"history": [{"timestamp": 1, "total": -1, "blocked": 0}]},
        {"history": [{"timestamp": 1, "total": 10, "blocked": -1}]},
    ],
)
async def test_invalid_history_is_not_cached_and_session_is_closed(
    mocker, history_request, payload
):
    mocker.patch(
        "api.pihole.retrieval.requests.get", return_value=make_response(payload)
    )
    logout = mocker.patch("api.pihole.authentication._pihole_logout")

    with pytest.raises(ValidationError):
        await retrieve_history(history_request)

    logout.assert_called_once_with("test-sid")
    history_request.app.state.redis.set.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "error", [requests.exceptions.Timeout, requests.exceptions.ConnectionError]
)
async def test_history_network_failure_closes_session(mocker, history_request, error):
    mocker.patch("api.pihole.retrieval.requests.get", side_effect=error("private"))
    logout = mocker.patch("api.pihole.authentication._pihole_logout")

    with pytest.raises(error):
        await retrieve_history(history_request)

    logout.assert_called_once_with("test-sid")
    history_request.app.state.redis.set.assert_not_awaited()


@pytest.mark.parametrize(
    "error",
    [
        requests.exceptions.Timeout("private"),
        ValueError("private"),
        Exception("private"),
    ],
)
def test_history_route_controls_errors(mocker, error, caplog):
    mocker.patch(
        "api.pihole.router.retrieve_history", new_callable=AsyncMock, side_effect=error
    )
    app = FastAPI()
    app.include_router(router)

    with TestClient(app) as client:
        response = client.get("/pihole/history/")

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Pi-hole history is unavailable. Try again later."
    }
    assert "private" not in response.text + caplog.text
