import logging

from fastapi import APIRouter, Request

from api.leetcode.models import (
    LCLanguagesResponse,
    LCProblemsSolvedModel,
    LCTopicsSolvedModel,
)
from api.leetcode.retrieval import (
    retrieve_languages,
    retrieve_problems_solved,
    retrieve_topics,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/leetcode",
    tags=["LeetCode"],
)


@router.get("/solved/", response_model=LCProblemsSolvedModel)
async def get_problems_solved(request: Request):
    return await retrieve_problems_solved(request)


@router.get("/languages/", response_model=LCLanguagesResponse)
async def get_problems_solved_per_language(request: Request):
    return await retrieve_languages(request)


@router.get("/topics/", response_model=LCTopicsSolvedModel)
async def get_problems_solved_per_topic(request: Request):
    return await retrieve_topics(request)
