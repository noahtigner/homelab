import json
from copy import deepcopy
from datetime import UTC, date, datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
import requests
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from api.config import Settings
from api.github.retrieval import retrieve_contributions
from api.github.router import router


@pytest.fixture
def calendar_request(monkeypatch):
    monkeypatch.setattr(Settings, "GITHUB_TOKEN", "test-github-token")
    request = MagicMock()
    request.app.state.redis = AsyncMock()
    request.app.state.redis.get.return_value = None
    return request


@pytest.fixture
def calendar_payload():
    return {
        "data": {
            "user": {
                "contributionsCollection": {
                    "startedAt": "2023-03-01T12:30:00Z",
                    "endedAt": "2024-03-01T12:30:00Z",
                    "contributionCalendar": {
                        "totalContributions": 10,
                        "weeks": [
                            {
                                "firstDay": "2024-02-25",
                                "contributionDays": [
                                    {
                                        "date": "2024-02-26",
                                        "weekday": 1,
                                        "contributionCount": 0,
                                        "contributionLevel": "NONE",
                                    },
                                    {
                                        "date": "2024-02-27",
                                        "weekday": 2,
                                        "contributionCount": 1,
                                        "contributionLevel": "FIRST_QUARTILE",
                                    },
                                    {
                                        "date": "2024-02-28",
                                        "weekday": 3,
                                        "contributionCount": 2,
                                        "contributionLevel": "SECOND_QUARTILE",
                                    },
                                    {
                                        "date": "2024-02-29",
                                        "weekday": 4,
                                        "contributionCount": 3,
                                        "contributionLevel": "THIRD_QUARTILE",
                                    },
                                    {
                                        "date": "2024-03-01",
                                        "weekday": 5,
                                        "contributionCount": 4,
                                        "contributionLevel": "FOURTH_QUARTILE",
                                    },
                                ],
                            }
                        ],
                    },
                },
            },
        },
    }


def make_response(payload, code=200):
    response = requests.Response()
    response.status_code = code
    response._content = json.dumps(payload).encode()
    return response


@pytest.mark.asyncio
async def test_calendar_authentication_transformation_and_cache(
    mocker, calendar_request, calendar_payload
):
    post = mocker.patch(
        "api.github.retrieval.requests.post",
        return_value=make_response(calendar_payload),
    )
    result = await retrieve_contributions(
        calendar_request, username="testuser", as_of="2024-03-01"
    )

    kwargs = post.call_args.kwargs
    assert post.call_args.args == ("https://api.github.com/graphql",)
    assert kwargs["headers"]["Authorization"] == "Bearer test-github-token"
    assert kwargs["json"]["variables"] == {"login": "testuser"}
    assert kwargs["json"]["operationName"] == "DashboardContributions"
    assert "contributionCalendar" in kwargs["json"]["query"]
    assert kwargs["timeout"] == (5, 20)
    assert result.username == "testuser"
    assert result.window_start == date(2023, 3, 2)
    assert result.window_end == date(2024, 3, 1)
    assert result.total_contributions == 10
    assert result.weeks[0].first_day == date(2024, 2, 25)
    assert result.weeks[0].days[3].date == date(2024, 2, 29)
    assert [day.contribution_count for day in result.weeks[0].days] == [0, 1, 2, 3, 4]
    assert result.weeks[0].days[0].contribution_level == "NONE"
    assert result.weeks[0].days[-1].contribution_level == "FOURTH_QUARTILE"
    redis = calendar_request.app.state.redis
    assert redis.set.call_args.kwargs["ex"] == 3600
    key, saved = redis.set.call_args.args
    assert "testuser" in key and "2024-03-01" in key
    assert "test-github-token" not in key + saved
    redis.get.return_value = saved
    assert (
        await retrieve_contributions(
            calendar_request, username="testuser", as_of="2024-03-01"
        )
        == result
    )
    post.assert_called_once()

    redis.get.return_value = None
    await retrieve_contributions(
        calendar_request, username="anotheruser", as_of="2024-03-01"
    )
    account_key = redis.set.call_args.args[0]
    await retrieve_contributions(
        calendar_request, username="testuser", as_of="2024-03-02"
    )
    assert len({key, account_key, redis.set.call_args.args[0]}) == 3


@pytest.mark.asyncio
async def test_calendar_without_token_has_setup_message(
    mocker, monkeypatch, calendar_request
):
    monkeypatch.setattr(Settings, "GITHUB_TOKEN", None)
    post = mocker.patch("api.github.retrieval.requests.post")
    with pytest.raises(HTTPException) as exc:
        await retrieve_contributions(
            calendar_request, username="testuser", as_of="2024-03-01"
        )
    assert exc.value.status_code == 503
    assert "Set GITHUB_TOKEN on the API" in exc.value.detail
    post.assert_not_called()
    calendar_request.app.state.redis.set.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "code,expected",
    [
        (401, "invalid or expired"),
        (403, "rate-limited"),
        (429, "rate-limited"),
        (502, "unavailable"),
    ],
)
async def test_calendar_http_failures(mocker, calendar_request, code, expected, caplog):
    mocker.patch(
        "api.github.retrieval.requests.post",
        return_value=make_response({"message": "test-github-token"}, code),
    )
    with pytest.raises(HTTPException) as exc:
        await retrieve_contributions(
            calendar_request, username="testuser", as_of="2024-03-01"
        )
    assert exc.value.status_code == 503
    assert expected in exc.value.detail
    assert "test-github-token" not in exc.value.detail + caplog.text
    calendar_request.app.state.redis.set.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "error", [requests.exceptions.Timeout, requests.exceptions.ConnectionError]
)
async def test_calendar_network_failures(mocker, calendar_request, error, caplog):
    mocker.patch(
        "api.github.retrieval.requests.post", side_effect=error("test-github-token")
    )
    with pytest.raises(HTTPException) as exc:
        await retrieve_contributions(
            calendar_request, username="testuser", as_of="2024-03-01"
        )
    assert exc.value.status_code == 503
    assert "test-github-token" not in exc.value.detail + caplog.text
    calendar_request.app.state.redis.set.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload",
    [
        None,
        [],
        {},
        {"errors": [{"message": "test-github-token"}]},
        {"data": {"user": None}},
    ],
)
async def test_calendar_invalid_graphql_data(mocker, calendar_request, payload, caplog):
    mocker.patch(
        "api.github.retrieval.requests.post", return_value=make_response(payload)
    )
    with pytest.raises(HTTPException) as exc:
        await retrieve_contributions(
            calendar_request, username="testuser", as_of="2024-03-01"
        )
    assert exc.value.status_code == 503
    assert "test-github-token" not in exc.value.detail + caplog.text
    calendar_request.app.state.redis.set.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "field,value",
    [
        ("date", "bad"),
        ("weekday", 0),
        ("contributionCount", -1),
        ("contributionLevel", "UNKNOWN"),
    ],
)
async def test_calendar_rejects_invalid_days(
    mocker, calendar_request, calendar_payload, field, value
):
    payload = deepcopy(calendar_payload)
    payload["data"]["user"]["contributionsCollection"]["contributionCalendar"]["weeks"][
        0
    ]["contributionDays"][0][field] = value
    mocker.patch(
        "api.github.retrieval.requests.post", return_value=make_response(payload)
    )
    with pytest.raises(HTTPException) as exc:
        await retrieve_contributions(
            calendar_request, username="testuser", as_of="2024-03-01"
        )
    assert exc.value.status_code == 503
    calendar_request.app.state.redis.set.assert_not_awaited()


def test_calendar_route_contract(mocker, calendar_payload, monkeypatch):
    monkeypatch.setattr(Settings, "GITHUB_TOKEN", "test-github-token")
    monkeypatch.setattr(Settings, "ACTIVITY_TIMEZONE", "UTC")
    mocker.patch("api.github.router.datetime").now.return_value = datetime(
        2024, 3, 1, 12, tzinfo=UTC
    )
    mocker.patch(
        "api.github.retrieval.requests.post",
        return_value=make_response(calendar_payload),
    )
    app = FastAPI()
    app.include_router(router)
    app.state.redis = AsyncMock()
    app.state.redis.get.return_value = None
    with TestClient(app) as client:
        response = client.get("/github/contributions/")
    assert response.status_code == 200
    assert response.json()["total_contributions"] == 10
    assert response.json()["weeks"][0]["days"][3] == {
        "date": "2024-02-29",
        "weekday": 4,
        "contribution_count": 3,
        "contribution_level": "THIRD_QUARTILE",
    }


@pytest.mark.asyncio
async def test_calendar_trims_boundary_weeks_and_recalculates_the_displayed_total(
    mocker, calendar_request, calendar_payload
):
    source = calendar_payload["data"]["user"]["contributionsCollection"][
        "contributionCalendar"
    ]
    source["weeks"].insert(
        0,
        {
            "firstDay": "2023-02-26",
            "contributionDays": [
                {
                    "date": "2023-03-01",
                    "weekday": 3,
                    "contributionCount": 100,
                    "contributionLevel": "FOURTH_QUARTILE",
                }
            ],
        },
    )
    source["weeks"][-1]["contributionDays"].append(
        {
            "date": "2024-03-02",
            "weekday": 6,
            "contributionCount": 100,
            "contributionLevel": "FOURTH_QUARTILE",
        }
    )
    source["totalContributions"] = 210
    mocker.patch(
        "api.github.retrieval.requests.post",
        return_value=make_response(calendar_payload),
    )
    result = await retrieve_contributions(
        calendar_request, username="testuser", as_of="2024-03-01"
    )
    assert (result.window_end - result.window_start).days + 1 == 366
    assert result.total_contributions == 10
    assert all(
        result.window_start <= day.date <= result.window_end
        for week in result.weeks
        for day in week.days
    )


def test_calendars_share_the_same_local_window_across_utc_midnight(
    mocker, calendar_payload, monkeypatch
):
    from api.leetcode.activity import activity_window

    monkeypatch.setattr(Settings, "GITHUB_TOKEN", "test-github-token")
    monkeypatch.setattr(Settings, "ACTIVITY_TIMEZONE", "America/Boise")
    now = datetime(2024, 3, 1, 2, tzinfo=UTC)
    mocker.patch("api.github.router.datetime").now.return_value = now
    mocker.patch(
        "api.github.retrieval.requests.post",
        return_value=make_response(calendar_payload),
    )
    app = FastAPI()
    app.include_router(router)
    app.state.redis = AsyncMock()
    app.state.redis.get.return_value = None
    with TestClient(app) as client:
        result = client.get("/github/contributions/").json()
    _, start, end, _ = activity_window(now)
    assert result["window_start"] == start.isoformat()
    assert result["window_end"] == end.isoformat() == "2024-02-29"
    assert (end - start).days + 1 == 366
