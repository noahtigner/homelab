from typing import Optional

from pydantic import BaseModel


class LCProblemDifficultyModel(BaseModel):
    total: int
    solved: int
    solved_percent: float
    beats_percent: Optional[float] = None


class LCProblemsSolvedModel(BaseModel):
    all: LCProblemDifficultyModel
    easy: LCProblemDifficultyModel
    medium: LCProblemDifficultyModel
    hard: LCProblemDifficultyModel


class LCLanguageStatModel(BaseModel):
    languageName: str
    problemsSolved: int


class LCLanguagesResponse(BaseModel):
    languages: list[LCLanguageStatModel]


class LCTopicStatModel(BaseModel):
    tagName: str
    tagSlug: str
    problemsSolved: int


class LCTopicsSolvedModel(BaseModel):
    advanced: list[LCTopicStatModel]
    intermediate: list[LCTopicStatModel]
    fundamental: list[LCTopicStatModel]
