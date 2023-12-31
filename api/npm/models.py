from typing import Optional

from pydantic import BaseModel

# class RepoActivity(BaseModel):
#     url: str
#     count: int


class NPMDownloadsDay(BaseModel):
    downloads: int
    day: str


class NPMDownloads(BaseModel):
    total: Optional[int] = None
    per_day: list[NPMDownloadsDay] = []
    start: Optional[str]
    end: Optional[str]


class NPMPackageInfo(BaseModel):
    name: str
    version: str
    description: str
    license: str
    homepage: str
    repository: str
    issues: str
    pulls: str
    downloads: NPMDownloads
