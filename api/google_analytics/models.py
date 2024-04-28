import datetime

from pydantic import BaseModel


class ActiveUsersDay(BaseModel):
    active_users: int
    date: str | datetime.date


class ActiveUsersPerDay(BaseModel):
    per_day: list[ActiveUsersDay] = []
