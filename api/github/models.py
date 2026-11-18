from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class RepoModel(BaseModel):
    id: int
    name: str
    url: str

    class Config:
        frozen = True


class EventModel(BaseModel):
    id: str
    type: str
    commits: int = 0
    repo: RepoModel
    created_at: str


class ContributionsModel(BaseModel):
    own_projects: int = 0
    oss_projects: int = 0


class EventsResponseModel(BaseModel):
    events: list[EventModel]
    events_seen: dict[str, int]
    repos_seen: list[RepoModel]
    contributions: ContributionsModel


class ContributionDayModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    date: date
    weekday: int = Field(ge=0, le=6, strict=True)
    contribution_count: int = Field(
        ge=0, strict=True, validation_alias="contributionCount"
    )
    contribution_level: Literal[
        "NONE", "FIRST_QUARTILE", "SECOND_QUARTILE", "THIRD_QUARTILE", "FOURTH_QUARTILE"
    ] = Field(validation_alias="contributionLevel")

    @model_validator(mode="after")
    def validate_weekday(self):
        if self.weekday != (self.date.weekday() + 1) % 7:
            raise ValueError("Contribution weekday must match its calendar date")
        return self


class ContributionWeekModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    first_day: date = Field(validation_alias="firstDay")
    days: list[ContributionDayModel] = Field(
        min_length=1, max_length=7, validation_alias="contributionDays"
    )


class ContributionCalendarModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    username: str
    window_start: date
    window_end: date
    total_contributions: int = Field(
        ge=0, strict=True, validation_alias="totalContributions"
    )
    weeks: list[ContributionWeekModel] = Field(min_length=1, max_length=54)
