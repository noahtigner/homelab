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
