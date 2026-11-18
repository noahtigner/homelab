from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

ACTIVITY_CALENDAR_DAYS = 366


def calendar_date_range(end: date) -> tuple[date, date]:
    return end - timedelta(days=ACTIVITY_CALENDAR_DAYS - 1), end


def activity_calendar_window(now: datetime, timezone_name: str):
    timezone = ZoneInfo(timezone_name)
    start, end = calendar_date_range(now.astimezone(timezone).date())
    cutoff = int(datetime.combine(start, datetime.min.time(), timezone).timestamp())
    return timezone, start, end, cutoff
