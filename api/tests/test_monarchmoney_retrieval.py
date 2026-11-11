import json
from unittest.mock import AsyncMock, MagicMock

import pytest
import requests
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from api.config import Settings
from api.monarchmoney.models import MoneyNetWorthHistoryResponse
from api.monarchmoney.retrieval import (
    retrieve_accounts,
    retrieve_net_worth_history,
    retrieve_portfolio,
)
from api.monarchmoney.router import router


@pytest.fixture
def monarch_request(monkeypatch):
    monkeypatch.setattr(Settings, "MONARCHMONEY_SESSION_ID", "test-session")
    monkeypatch.setattr(Settings, "MONARCHMONEY_CSRF_TOKEN", "test-csrf-token")
    request = MagicMock()
    request.app.state.redis = AsyncMock()
    request.app.state.redis.get.return_value = None
    return request


def make_response(code, payload):
    response = requests.Response()
    response.status_code = code
    response._content = json.dumps(payload).encode()
    return response


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "retrieve,operation,payload,expected",
    [
        (
            retrieve_accounts,
            "Web_GetAccountsPage",
            {"data": {"accountTypeSummaries": []}},
            {"data": {"accountTypeSummaries": []}},
        ),
        (
            retrieve_portfolio,
            "Web_GetInvestmentsDashboardCard",
            {
                "data": {
                    "portfolio": {
                        "performance": {
                            "totalValue": 1000.0,
                            "oneDayChangeDollars": -10.0,
                        }
                    }
                }
            },
            {"totalValue": 1000.0, "oneDayChangeDollars": -10.0},
        ),
    ],
)
async def test_session_authentication_and_success(
    mocker, monarch_request, retrieve, operation, payload, expected
):
    post = mocker.patch(
        "api.monarchmoney.retrieval.requests.post",
        return_value=make_response(200, payload),
    )

    result = await retrieve(monarch_request)

    assert result.model_dump() == expected
    post.assert_called_once()
    assert post.call_args.args == ("https://api.monarch.com/graphql",)
    kwargs = post.call_args.kwargs
    assert kwargs["json"]["operationName"] == operation
    assert kwargs["cookies"] == {
        "session_id": "test-session",
        "csrftoken": "test-csrf-token",
    }
    assert kwargs["headers"]["X-CSRFToken"] == kwargs["cookies"]["csrftoken"]
    assert kwargs["headers"]["Origin"] == "https://app.monarch.com"
    assert kwargs["headers"]["User-Agent"].startswith("Mozilla/5.0")
    assert "Authorization" not in kwargs["headers"]
    assert kwargs["timeout"] == (5, 30)
    monarch_request.app.state.redis.set.assert_awaited_once()
    assert monarch_request.app.state.redis.set.call_args.kwargs["ex"] == 300


@pytest.mark.asyncio
@pytest.mark.parametrize("retrieve", [retrieve_accounts, retrieve_portfolio])
@pytest.mark.parametrize(
    "code,payload,expected_message",
    [
        (
            401,
            {"detail": "Authentication credentials were not provided."},
            "authentication needs renewal",
        ),
        (
            403,
            {"detail": "CSRF Failed: CSRF cookie not set."},
            "rejected CSRF validation",
        ),
        (403, {"detail": "Access denied"}, "Monarch rejected the request"),
        (403, {"detail": ["Unexpected error shape"]}, "Monarch rejected the request"),
        (502, {"detail": "Upstream unavailable"}, "upstream HTTP error"),
    ],
)
async def test_http_failures_are_actionable_and_not_cached(
    mocker, monarch_request, retrieve, code, payload, expected_message, caplog
):
    mocker.patch(
        "api.monarchmoney.retrieval.requests.post",
        return_value=make_response(code, payload),
    )

    with pytest.raises(HTTPException) as exc:
        await retrieve(monarch_request)

    assert exc.value.status_code == 503
    assert expected_message in exc.value.detail
    assert expected_message in caplog.text
    assert "Web_Get" in caplog.text
    assert "test-session" not in caplog.text
    assert "test-csrf-token" not in caplog.text
    monarch_request.app.state.redis.set.assert_not_awaited()


def history_snapshot(day, balance=800):
    return {
        "date": day,
        "balance": balance,
        "assetsBalance": balance + 200,
        "liabilitiesBalance": -200,
    }


@pytest.mark.asyncio
@pytest.mark.parametrize("start_date", [None, "2026-05-10"])
async def test_history_query_and_sorted_signed_snapshots(
    mocker, monarch_request, start_date
):
    snapshots = [
        history_snapshot("2026-11-10", 900),
        history_snapshot("2026-05-10"),
        history_snapshot("2026-11-10", 950),
    ]
    post = mocker.patch(
        "api.monarchmoney.retrieval.requests.post",
        return_value=make_response(200, {"data": {"aggregateSnapshots": snapshots}}),
    )

    result = await retrieve_net_worth_history(
        monarch_request, end_date="2026-11-10", start_date=start_date
    )

    body = post.call_args.kwargs["json"]
    assert body["operationName"] == "Common_GetAggregateSnapshots"
    expected_filters = {
        "endDate": "2026-11-10",
        "useAdaptiveGranularity": False,
        "accountFilters": {},
    }
    if start_date is not None:
        expected_filters["startDate"] = start_date
    assert body["variables"] == {"filters": expected_filters}
    assert result.model_dump(mode="json") == {"snapshots": [snapshots[1], snapshots[2]]}
    assert monarch_request.app.state.redis.set.call_args.kwargs["ex"] == 300


@pytest.mark.asyncio
async def test_history_cache_separates_ranges(mocker, monarch_request):
    cached = {}

    async def set_cached(key, value, ex):
        cached[key] = value

    redis = monarch_request.app.state.redis
    redis.get.side_effect = cached.get
    redis.set.side_effect = set_cached
    post = mocker.patch(
        "api.monarchmoney.retrieval.requests.post",
        return_value=make_response(200, {"data": {"aggregateSnapshots": []}}),
    )

    for start_date in ["2026-05-10", "2026-05-10", "2026-10-10", None]:
        result = await retrieve_net_worth_history(
            monarch_request, end_date="2026-11-10", start_date=start_date
        )
        assert result.snapshots == []

    assert post.call_count == 3
    assert len(cached) == 3


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload,expected_message",
    [
        ({"errors": [{"message": "private upstream details"}]}, "complete the query"),
        ([], "invalid response"),
        ({"data": None}, "invalid net-worth history"),
        ({"data": {"aggregateSnapshots": None}}, "invalid net-worth history"),
        (
            {"data": {"aggregateSnapshots": [history_snapshot("not-a-date")]}},
            "invalid net-worth history",
        ),
    ],
)
async def test_invalid_history_is_actionable_and_not_cached(
    mocker, monarch_request, payload, expected_message, caplog
):
    mocker.patch(
        "api.monarchmoney.retrieval.requests.post",
        return_value=make_response(200, payload),
    )

    with pytest.raises(HTTPException) as exc:
        await retrieve_net_worth_history(monarch_request, end_date="2026-11-10")

    assert exc.value.status_code == 503
    assert expected_message in exc.value.detail
    assert "private upstream details" not in exc.value.detail + caplog.text
    monarch_request.app.state.redis.set.assert_not_awaited()


@pytest.mark.asyncio
async def test_non_json_history_is_not_cached(mocker, monarch_request):
    response = make_response(200, {})
    response._content = b"not JSON"
    mocker.patch("api.monarchmoney.retrieval.requests.post", return_value=response)

    with pytest.raises(HTTPException, match="invalid response"):
        await retrieve_net_worth_history(monarch_request, end_date="2026-11-10")

    monarch_request.app.state.redis.set.assert_not_awaited()


@pytest.mark.parametrize(
    "params,expected_status",
    [
        ({"end_date": "2026-11-10"}, 200),
        ({"start_date": "2026-05-10", "end_date": "2026-11-10"}, 200),
        ({"start_date": "2026-11-11", "end_date": "2026-11-10"}, 422),
        ({"end_date": "2026-02-30"}, 422),
        ({}, 422),
    ],
)
def test_history_route_validates_and_forwards_dates(mocker, params, expected_status):
    retrieve = mocker.patch(
        "api.monarchmoney.router.retrieve_net_worth_history",
        new_callable=AsyncMock,
        return_value=MoneyNetWorthHistoryResponse(snapshots=[]),
    )
    app = FastAPI()
    app.include_router(router)

    with TestClient(app) as client:
        response = client.get("/money/net-worth-history/", params=params)

    assert response.status_code == expected_status
    if expected_status == 200:
        assert response.json() == {"snapshots": []}
        assert retrieve.call_args.kwargs == {
            "end_date": params["end_date"],
            "start_date": params.get("start_date"),
        }
    else:
        retrieve.assert_not_awaited()


@pytest.mark.asyncio
async def test_non_json_forbidden_response(mocker, monarch_request):
    response = make_response(403, {})
    response._content = b"error code: 1010"
    mocker.patch("api.monarchmoney.retrieval.requests.post", return_value=response)

    with pytest.raises(HTTPException) as exc:
        await retrieve_accounts(monarch_request)

    assert exc.value.status_code == 503
    assert "Monarch rejected the request" in exc.value.detail
    monarch_request.app.state.redis.set.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize("retrieve", [retrieve_accounts, retrieve_portfolio])
@pytest.mark.parametrize(
    "error,expected_message",
    [
        (requests.exceptions.Timeout, "request timed out"),
        (requests.exceptions.ConnectionError, "Could not connect"),
    ],
)
async def test_network_failures_are_not_cached(
    mocker, monarch_request, retrieve, error, expected_message, caplog
):
    mocker.patch(
        "api.monarchmoney.retrieval.requests.post",
        side_effect=error("sensitive upstream exception text"),
    )

    with pytest.raises(HTTPException) as exc:
        await retrieve(monarch_request)

    assert exc.value.status_code == 503
    assert expected_message in exc.value.detail
    assert "sensitive upstream exception text" not in exc.value.detail + caplog.text
    monarch_request.app.state.redis.set.assert_not_awaited()
