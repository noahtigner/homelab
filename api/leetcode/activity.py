import asyncio
import logging
import time
from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfoNotFoundError

import requests
from pydantic import ValidationError

from api.config import Settings
from api.leetcode.activity_models import (
    ActivityCalendar,
    ActivityDay,
    DifficultyCounts,
    SubmissionPage,
)
from api.leetcode.activity_store import ActivityStore
from api.utils.calendar import ACTIVITY_CALENDAR_DAYS, activity_calendar_window

logger = logging.getLogger(__name__)
PAGE_SIZE = 20
PAGE_OVERLAP = 5
MAX_PAGES = 20
BATCH_SECONDS = 30

IDENTITY_QUERY = "query CalendarIdentity { userStatus { username isSignedIn } }"
HISTORY_QUERY = """
    query CalendarHistory($offset: Int!, $limit: Int!) {
        submissionList(offset: $offset, limit: $limit) {
            hasNext
            submissions { id timestamp statusDisplay titleSlug }
        }
    }
"""


class ActivityError(Exception):
    pass


def configured() -> bool:
    return bool(Settings.LEETCODE_SESSION and Settings.LEETCODE_CSRF_TOKEN)


def activity_store() -> ActivityStore:
    return ActivityStore(Settings.LEETCODE_ACTIVITY_DB, Settings.LEETCODE_USERNAME)


def activity_window(now: datetime):
    try:
        return activity_calendar_window(now, Settings.ACTIVITY_TIMEZONE)
    except ZoneInfoNotFoundError:
        raise ActivityError(
            "Set GENERIC_TIMEZONE to a valid IANA timezone on the API."
        ) from None


def _graphql(query: str, variables: dict | None = None) -> dict:
    try:
        response = requests.post(
            "https://leetcode.com/graphql/",
            json={"query": query, "variables": variables or {}},
            cookies={
                "LEETCODE_SESSION": Settings.LEETCODE_SESSION,
                "csrftoken": Settings.LEETCODE_CSRF_TOKEN,
            },
            headers={
                "X-CSRFToken": Settings.LEETCODE_CSRF_TOKEN,
                "Referer": "https://leetcode.com/",
                "User-Agent": "Mozilla/5.0 homelab-dashboard",
            },
            timeout=(5, 20),
        )
        response.raise_for_status()
        payload = response.json()
        if (
            not isinstance(payload, dict)
            or payload.get("errors")
            or not isinstance(payload.get("data"), dict)
        ):
            raise ActivityError(
                "LeetCode could not complete the history query. Check session access and try again."
            )
        return payload["data"]
    except requests.exceptions.Timeout:
        raise ActivityError(
            "LeetCode history request timed out. Try again later."
        ) from None
    except requests.exceptions.RequestException:
        raise ActivityError(
            "LeetCode history is unavailable. Check the session cookies or try again later."
        ) from None
    except ValueError:
        raise ActivityError(
            "LeetCode returned invalid history data. Try again later."
        ) from None


def _questions(slugs: list[str]) -> dict[str, str | None]:
    variables = {f"slug{i}": slug for i, slug in enumerate(slugs)}
    declarations = ",".join(f"${key}: String!" for key in variables)
    fields = " ".join(
        f"q{i}: question(titleSlug: $slug{i}) {{ difficulty }}"
        for i in range(len(slugs))
    )
    data = _graphql(
        f"query CalendarQuestions({declarations}) {{ {fields} }}", variables
    )
    result = {}
    for index, slug in enumerate(slugs):
        question = data[f"q{index}"]
        difficulty = question.get("difficulty") if isinstance(question, dict) else None
        if difficulty is not None and difficulty not in ("Easy", "Medium", "Hard"):
            raise ActivityError("LeetCode returned an unknown problem difficulty.")
        result[slug] = difficulty.lower() if difficulty else None
    return result


def synchronize_activity(now: datetime | None = None):
    if not configured():
        return
    now = now or datetime.now(UTC)
    clock = int(now.timestamp())
    store = activity_store()
    state = store.claim(clock)
    if state is None:
        return
    deadline = time.monotonic() + BATCH_SECONDS
    try:
        _, _, _, cutoff = activity_window(now)
        identity = _graphql(IDENTITY_QUERY)["userStatus"]
        if identity.get("isSignedIn") is not True:
            raise ActivityError(
                "LeetCode session has expired. Update the session and CSRF cookies on the API."
            )
        if (
            str(identity.get("username", "")).casefold()
            != Settings.LEETCODE_USERNAME.casefold()
        ):
            raise ActivityError(
                "The LeetCode session account does not match LEETCODE_USERNAME."
            )

        if not state.metadata_pending or state.offset:
            incremental = (
                state.covered_from is not None and state.covered_from <= cutoff
            )
            if not state.scan_started:
                state.scan_started = clock
                # Revisit recent history so delayed judging is not skipped at a saved ID.
                state.scan_cutoff = (
                    max(cutoff, (state.updated_at or clock) - 86400)
                    if incremental
                    else cutoff
                )
            offset = max(0, state.offset - PAGE_OVERLAP)
            boundary = state.boundary_id
            linked = boundary is None
            previous_ids = None
            for _ in range(MAX_PAGES):
                page = SubmissionPage.model_validate(
                    _graphql(HISTORY_QUERY, {"offset": offset, "limit": PAGE_SIZE})[
                        "submissionList"
                    ]
                )
                items = page.submissions
                ids = [item.id for item in items]
                if not items and page.hasNext:
                    raise ActivityError(
                        "LeetCode returned an incomplete history page. Try again later."
                    )
                if previous_ids == ids and ids:
                    raise ActivityError(
                        "LeetCode history pagination did not advance. Try again later."
                    )
                if any(a.timestamp < b.timestamp for a, b in zip(items, items[1:])):
                    raise ActivityError(
                        "LeetCode history ordering could not be verified."
                    )
                previous_ids = ids
                linked = linked or boundary in ids
                finished = not page.hasNext or (
                    items and items[-1].timestamp < state.scan_cutoff
                )
                if not linked and finished:
                    # An overlap anchor was removed or the upstream history changed.
                    state.offset = 0
                    state.boundary_id = None
                    state.scan_started = 0
                    raise ActivityError(
                        "History changed during pagination. A fresh scan will start on retry."
                    )
                if linked:
                    if finished:
                        if not incremental:
                            state.covered_from = (
                                0 if not page.hasNext else state.scan_cutoff
                            )
                        state.updated_at = state.scan_started
                        state.offset = 0
                        state.boundary_id = None
                        state.scan_started = 0
                        state.metadata_pending = True
                    else:
                        state.offset = offset + len(items)
                        state.boundary_id = items[-1].id
                    store.checkpoint(state, items)
                if finished:
                    break
                # Keep an overlap between every page; do not assume offsets are stable.
                boundary = items[-1].id if linked else boundary
                linked = False
                offset += max(1, len(items) - PAGE_OVERLAP)
                if time.monotonic() >= deadline:
                    break

        slugs = store.pending_questions(clock, cutoff)
        if slugs and time.monotonic() < deadline:
            store.save_questions(_questions(slugs), clock)
        pending = bool(store.pending_questions(clock, cutoff, limit=1))
        state.metadata_pending = pending
        unfinished = bool(state.scan_started or pending)
        state.status = "partial" if unfinished else "ready"
        state.message = (
            "Fetching accepted history and problem difficulties."
            if unfinished
            else None
        )
        store.finish(
            state,
            clock
            + (
                5
                if unfinished or (state.updated_at and clock - state.updated_at > 60)
                else 900
            ),
        )
    except (
        ActivityError,
        ValidationError,
        KeyError,
        TypeError,
        AttributeError,
    ) as error:
        # No upstream bodies, cookie values, or exception strings are logged or returned.
        state.status = "error"
        state.message = (
            str(error)
            if isinstance(error, ActivityError)
            else "LeetCode returned invalid activity data. Try again later."
        )
        store.finish(state, clock + 900)
        logger.warning("LeetCode activity synchronization failed: %s", state.message)


def read_activity(now: datetime | None = None) -> ActivityCalendar:
    now = now or datetime.now(UTC)
    timezone, start, end, cutoff = activity_window(now)
    state, submissions = activity_store().snapshot(cutoff)
    grouped: dict[date, dict[str, str | None]] = {}
    for row in submissions:
        day = datetime.fromtimestamp(row["timestamp"], timezone).date()
        if start <= day <= end:
            grouped.setdefault(day, {})[row["slug"]] = row["difficulty"]
    updated = (
        datetime.fromtimestamp(state.updated_at, UTC) if state.updated_at else None
    )
    days = []
    for offset in range(ACTIVITY_CALENDAR_DAYS):
        day = start + timedelta(days=offset)
        problems = grouped.get(day, {})
        counts = DifficultyCounts(
            **{
                level: sum(value == level for value in problems.values())
                for level in ("easy", "medium", "hard")
            }
        )
        day_start = int(
            datetime.combine(day, datetime.min.time(), timezone).timestamp()
        )
        covered = (
            state.covered_from is not None
            and day_start >= state.covered_from
            and updated is not None
            and day <= updated.astimezone(timezone).date()
        )
        complete = covered and all(value is not None for value in problems.values())
        hardest = (
            next(
                (
                    level
                    for level in ("hard", "medium", "easy")
                    if getattr(counts, level)
                ),
                None,
            )
            if complete
            else None
        )
        days.append(
            ActivityDay(
                date=day,
                solved_count=len(problems),
                by_difficulty=counts,
                hardest_difficulty=hardest,
                coverage=(
                    "complete" if complete else "partial" if problems else "unknown"
                ),
            )
        )
    status = state.status
    message = state.message
    if status == "ready" and any(day.coverage != "complete" for day in days):
        status = "partial"
        message = "Some dates or problem difficulties are not fully known. Hatched squares indicate incomplete data."
    return ActivityCalendar(
        username=Settings.LEETCODE_USERNAME,
        window_start=start,
        window_end=end,
        timezone=Settings.ACTIVITY_TIMEZONE,
        updated_at=updated,
        sync_status=status,
        message=message,
        days=days,
    )


async def activity_worker():
    while True:
        try:
            await asyncio.to_thread(synchronize_activity)
        except Exception:
            logger.warning(
                "LeetCode activity storage or synchronization worker is unavailable."
            )
            await asyncio.sleep(60)
        await asyncio.sleep(5)
