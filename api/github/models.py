from typing import Union
from pydantic import BaseModel

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
