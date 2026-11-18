from datetime import UTC, datetime
from unittest.mock import MagicMock

import pytest
import requests
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.config import Settings
from api.leetcode import activity
from api.leetcode.activity import activity_store, read_activity, synchronize_activity
from api.leetcode.router import router

NOW = datetime(2026, 11, 15, 12, tzinfo=UTC)


def stamp(value):
    return int(datetime.fromisoformat(value).timestamp())


def submission(
    identifier, slug, timestamp="2026-06-10T12:00:00+00:00", status="Accepted"
):
    return {
        "id": str(identifier),
        "timestamp": stamp(timestamp),
        "titleSlug": slug,
        "statusDisplay": status,
    }


@pytest.fixture
def activity_settings(monkeypatch, tmp_path):
    monkeypatch.setattr(
        Settings, "LEETCODE_ACTIVITY_DB", str(tmp_path / "activity.sqlite3")
    )
    monkeypatch.setattr(Settings, "LEETCODE_USERNAME", "testuser")
    monkeypatch.setattr(Settings, "LEETCODE_SESSION", "private-session")
    monkeypatch.setattr(Settings, "LEETCODE_CSRF_TOKEN", "private-csrf")
    monkeypatch.setattr(Settings, "ACTIVITY_TIMEZONE", "UTC")


def upstream(monkeypatch, items, difficulties=None, identity=None):
    difficulties = difficulties or {"hard": "Hard", "medium": "Medium", "easy": "Easy"}
    calls = []

    def query(text, variables=None):
        calls.append((text, variables))
        if "userStatus" in text:
            return {
                "userStatus": identity or {"username": "testuser", "isSignedIn": True}
            }
        if "submissionList" in text:
            offset, limit = variables["offset"], variables["limit"]
            end = offset + limit
            return {
                "submissionList": {
                    "hasNext": end < len(items),
                    "submissions": items[offset:end],
                }
            }
        return {
            f"q{i}": {"difficulty": difficulties.get(slug)}
            for i, slug in enumerate(variables.values())
        }

    monkeypatch.setattr(activity, "_graphql", query)
    return calls


def day(calendar, value):
    return next(item for item in calendar.days if item.date.isoformat() == value)


def test_unique_daily_solves_hardest_difficulty_persistence_and_incremental_refresh(
    activity_settings, monkeypatch
):
    items = [
        submission(9, "hard", "2026-06-11T12:00:00+00:00"),
        submission(8, "hard"),
        submission(7, "hard"),
        submission(6, "medium"),
        submission(5, "easy"),
        submission(4, "ignored", status="Wrong Answer"),
    ]
    calls = upstream(monkeypatch, items)
    synchronize_activity(NOW)
    calendar = read_activity(NOW)
    assert len(calendar.days) == 366
    assert calendar.sync_status == "ready"
    assert day(calendar, "2026-06-10").solved_count == 3
    assert day(calendar, "2026-06-10").by_difficulty.model_dump() == {
        "easy": 1,
        "medium": 1,
        "hard": 1,
    }
    assert day(calendar, "2026-06-10").hardest_difficulty == "hard"
    assert day(calendar, "2026-06-11").solved_count == 1
    assert day(calendar, "2026-06-12").coverage == "complete"
    assert day(calendar, "2026-06-12").hardest_difficulty is None
    assert calendar.updated_at == NOW
    assert read_activity(NOW) == calendar
    before = len(calls)
    synchronize_activity(NOW)
    assert len(calls) == before  # Backoff/refresh cadence is stored with the ledger.

    items.insert(0, submission(10, "medium", "2026-11-15T12:10:00+00:00"))
    later = datetime(2026, 11, 15, 12, 16, tzinfo=UTC)
    synchronize_activity(later)
    assert day(read_activity(later), "2026-11-15").hardest_difficulty == "medium"
    assert day(read_activity(later), "2026-06-10").solved_count == 3
    history_calls = [
        variables for text, variables in calls[before:] if "submissionList" in text
    ]
    assert len(history_calls) == 1


def test_bounded_backfill_resumes_overlapping_pages_and_never_invents_empty_days(
    activity_settings, monkeypatch
):
    monkeypatch.setattr(activity, "PAGE_SIZE", 4)
    monkeypatch.setattr(activity, "PAGE_OVERLAP", 1)
    monkeypatch.setattr(activity, "MAX_PAGES", 1)
    items = [submission(i, "easy") for i in range(12, 0, -1)]
    upstream(monkeypatch, items)
    synchronize_activity(NOW)
    partial = read_activity(NOW)
    assert partial.sync_status == "partial"
    assert day(partial, "2026-06-10").coverage == "partial"
    assert day(partial, "2026-06-10").hardest_difficulty is None
    assert day(partial, "2026-06-12").coverage == "unknown"
    for seconds in [6, 12, 18]:
        synchronize_activity(datetime.fromtimestamp(NOW.timestamp() + seconds, UTC))
    complete = read_activity(NOW)
    assert complete.sync_status == "ready"
    assert day(complete, "2026-06-10").solved_count == 1
    assert all(item.coverage == "complete" for item in complete.days)


def test_unknown_difficulty_is_not_colored_as_easy_or_as_empty(
    activity_settings, monkeypatch
):
    difficulties = {"unknown": None, "easy": "Easy"}
    upstream(
        monkeypatch, [submission(1, "unknown"), submission(2, "easy")], difficulties
    )
    synchronize_activity(NOW)
    calendar = read_activity(NOW)
    result = day(calendar, "2026-06-10")
    assert calendar.sync_status == "partial"
    assert result.coverage == "partial"
    assert result.solved_count == 2
    assert result.hardest_difficulty is None

    difficulties["unknown"] = "Hard"
    later = datetime.fromtimestamp(NOW.timestamp() + 900, UTC)
    synchronize_activity(later)
    refreshed = read_activity(later)
    assert refreshed.sync_status == "ready"
    assert day(refreshed, "2026-06-10").hardest_difficulty == "hard"


@pytest.mark.parametrize(
    "value,expected",
    [
        ("2026-03-08T06:30:00+00:00", "2026-03-07"),
        ("2026-03-08T09:30:00+00:00", "2026-03-08"),
    ],
)
def test_timezone_and_dst_boundaries(activity_settings, monkeypatch, value, expected):
    monkeypatch.setattr(Settings, "ACTIVITY_TIMEZONE", "America/Boise")
    upstream(monkeypatch, [submission(1, "hard", value)])
    synchronize_activity(NOW)
    calendar = read_activity(NOW)
    assert calendar.timezone == "America/Boise"
    assert day(calendar, expected).hardest_difficulty == "hard"


def test_leap_day(activity_settings, monkeypatch):
    upstream(monkeypatch, [submission(1, "medium", "2024-02-29T12:00:00+00:00")])
    now = datetime(2024, 3, 1, 12, tzinfo=UTC)
    synchronize_activity(now)
    assert day(read_activity(now), "2024-02-29").hardest_difficulty == "medium"


@pytest.mark.parametrize(
    "identity",
    [
        {"username": "other", "isSignedIn": True},
        {"username": "testuser", "isSignedIn": False},
    ],
)
def test_identity_failure_does_not_ingest_or_expose_credentials(
    activity_settings, monkeypatch, identity, caplog
):
    upstream(monkeypatch, [submission(1, "hard")], identity=identity)
    synchronize_activity(NOW)
    calendar = read_activity(NOW)
    assert calendar.sync_status == "error"
    assert all(item.coverage == "unknown" for item in calendar.days)
    assert "private-session" not in calendar.model_dump_json() + caplog.text
    assert "private-csrf" not in calendar.model_dump_json() + caplog.text


def test_lease_and_account_isolation(activity_settings, monkeypatch):
    store = activity_store()
    assert store.claim(int(NOW.timestamp())) is not None
    assert activity_store().claim(int(NOW.timestamp())) is None
    monkeypatch.setattr(Settings, "LEETCODE_USERNAME", "other")
    assert activity_store().claim(int(NOW.timestamp())) is not None
    assert all(item.coverage == "unknown" for item in read_activity(NOW).days)


def test_missing_overlap_anchor_does_not_claim_complete_history(
    activity_settings, monkeypatch
):
    monkeypatch.setattr(activity, "PAGE_SIZE", 4)
    monkeypatch.setattr(activity, "PAGE_OVERLAP", 1)
    monkeypatch.setattr(activity, "MAX_PAGES", 1)
    items = [submission(i, "easy") for i in range(8, 0, -1)]
    upstream(monkeypatch, items)
    synchronize_activity(NOW)
    del items[3]  # The saved overlap anchor was removed upstream.
    for seconds in [6, 12, 18]:
        synchronize_activity(datetime.fromtimestamp(NOW.timestamp() + seconds, UTC))
    calendar = read_activity(NOW)
    assert calendar.sync_status == "error"
    assert "fresh scan" in calendar.message
    assert all(item.coverage != "complete" for item in calendar.days)


def test_graphql_authentication_uses_minimal_fields_and_matching_csrf(
    activity_settings, monkeypatch
):
    response = MagicMock()
    response.json.return_value = {
        "data": {"userStatus": {"username": "testuser", "isSignedIn": True}}
    }
    post = MagicMock(return_value=response)
    monkeypatch.setattr(activity.requests, "post", post)
    activity._graphql(activity.IDENTITY_QUERY)
    kwargs = post.call_args.kwargs
    assert kwargs["cookies"] == {
        "LEETCODE_SESSION": "private-session",
        "csrftoken": "private-csrf",
    }
    assert kwargs["headers"]["X-CSRFToken"] == "private-csrf"
    assert kwargs["timeout"] == (5, 20)
    assert "code" not in activity.HISTORY_QUERY.lower()


@pytest.mark.parametrize(
    "failure",
    [
        requests.exceptions.Timeout("private-session"),
        requests.exceptions.ConnectionError("private-csrf"),
    ],
)
def test_network_failure_is_controlled(activity_settings, monkeypatch, failure):
    monkeypatch.setattr(activity.requests, "post", MagicMock(side_effect=failure))
    synchronize_activity(NOW)
    result = read_activity(NOW)
    assert result.sync_status == "error"
    assert "private-session" not in result.model_dump_json()
    assert "private-csrf" not in result.model_dump_json()


def test_routes_setup_snapshot_and_retry(activity_settings, monkeypatch):
    app = FastAPI()
    app.include_router(router)
    with TestClient(app) as client:
        response = client.get("/leetcode/calendar/")
        assert response.status_code == 200
        assert response.json()["sync_status"] == "pending"
        assert len(response.json()["days"]) == 366
        assert client.post("/leetcode/calendar/sync/").json() == {"status": "scheduled"}
        monkeypatch.setattr(Settings, "LEETCODE_SESSION", None)
        response = client.get("/leetcode/calendar/")
        assert response.status_code == 503
        assert "LEETCODE_SESSION" in response.json()["detail"]


def test_incremental_scan_revisits_pending_submissions_behind_the_last_seen_head(
    activity_settings, monkeypatch
):
    now = datetime(2026, 11, 15, 12, tzinfo=UTC)
    items = [
        submission(3, "easy", "2026-11-15T11:50:00+00:00"),
        submission(2, "hard", "2026-11-15T11:49:00+00:00", status="Pending"),
        submission(1, "easy", "2026-11-13T00:00:00+00:00"),
    ]
    upstream(monkeypatch, items)
    synchronize_activity(now)
    assert day(read_activity(now), "2026-11-15").solved_count == 1
    items[1]["statusDisplay"] = "Accepted"
    items[:0] = [
        submission(i, "easy", "2026-11-15T12:05:00+00:00") for i in range(22, 3, -1)
    ]
    later = datetime(2026, 11, 15, 12, 15, tzinfo=UTC)
    synchronize_activity(later)
    result = day(read_activity(later), "2026-11-15")
    assert result.solved_count == 2
    assert result.hardest_difficulty == "hard"
