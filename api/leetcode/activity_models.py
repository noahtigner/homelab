from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

Difficulty = Literal["easy", "medium", "hard"]


class DifficultyCounts(BaseModel):
    easy: int = Field(default=0, ge=0)
    medium: int = Field(default=0, ge=0)
    hard: int = Field(default=0, ge=0)


class ActivityDay(BaseModel):
    date: date
    solved_count: int = Field(ge=0)
    by_difficulty: DifficultyCounts
    hardest_difficulty: Difficulty | None
    coverage: Literal["complete", "partial", "unknown"]


class ActivityCalendar(BaseModel):
    username: str
    window_start: date
    window_end: date
    timezone: str
    updated_at: datetime | None
    sync_status: Literal["pending", "syncing", "partial", "ready", "error"]
    message: str | None
    days: list[ActivityDay]


class Submission(BaseModel):
    id: str
    timestamp: int = Field(gt=0)
    statusDisplay: str
    titleSlug: str = Field(min_length=1)


class SubmissionPage(BaseModel):
    hasNext: bool = Field(strict=True)
    submissions: list[Submission]


class SyncState(BaseModel):
    offset: int = 0
    boundary_id: str | None = None
    scan_started: int = 0
    scan_cutoff: int = 0
    covered_from: int | None = None
    updated_at: int | None = None
    metadata_pending: bool = False
    status: Literal["pending", "syncing", "partial", "ready", "error"] = "pending"
    message: str | None = None
