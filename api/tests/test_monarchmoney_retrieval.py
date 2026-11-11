import json
from unittest.mock import AsyncMock, MagicMock

import pytest
import requests
from fastapi import HTTPException

from api.config import Settings
from api.monarchmoney.retrieval import retrieve_accounts, retrieve_portfolio


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
