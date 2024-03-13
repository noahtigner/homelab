import json
import logging

import requests
from fastapi import APIRouter, HTTPException, Response, Request, status

from api.config import Settings
from api.leetcode.models import (
    LCLanguageStatModel,
    LCProblemDifficultyModel,
    LCProblemsSolvedModel,
    LCTopicsSolvedModel,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/leetcode",
    tags=["LeetCode"],
)


@router.get("/solved/", response_model=LCProblemsSolvedModel)
async def get_problems_solved(request: Request, response: Response):
    url = "https://leetcode.com/graphql/"

    # Try to get the result from cache
    cached_result = await request.app.state.redis.get("lc:solved")
    if cached_result is not None:
        logger.info("Cache hit")
        return LCProblemsSolvedModel(**json.loads(cached_result))

    query = """
        query userProblemsSolved($username: String!) {
            allQuestionsCount {
                difficulty
                count
            }
            matchedUser(username: $username) {
                problemsSolvedBeatsStats {
                    difficulty
                    percentage
                }
                submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
            }
        }
    """

    request_body = {
        "query": query,
        "variables": {"username": Settings.LEETCODE_USERNAME},
        "operationName": "userProblemsSolved",
    }

    try:
        r = requests.post(url, json=request_body)
        r.raise_for_status()
        response.status_code = r.status_code
        raw_data = r.json()["data"]

        output = LCProblemsSolvedModel(
            all=LCProblemDifficultyModel(
                total=raw_data["allQuestionsCount"][0]["count"],
                solved=raw_data["matchedUser"]["submitStatsGlobal"]["acSubmissionNum"][
                    0
                ]["count"],
                solved_percent=raw_data["matchedUser"]["submitStatsGlobal"][
                    "acSubmissionNum"
                ][0]["count"]
                / raw_data["allQuestionsCount"][0]["count"]
                * 100,
            ),
            easy=LCProblemDifficultyModel(
                total=raw_data["allQuestionsCount"][1]["count"],
                solved=raw_data["matchedUser"]["submitStatsGlobal"]["acSubmissionNum"][
                    1
                ]["count"],
                solved_percent=raw_data["matchedUser"]["submitStatsGlobal"][
                    "acSubmissionNum"
                ][1]["count"]
                / raw_data["allQuestionsCount"][1]["count"]
                * 100,
                beats_percent=raw_data["matchedUser"]["problemsSolvedBeatsStats"][0][
                    "percentage"
                ],
            ),
            medium=LCProblemDifficultyModel(
                total=raw_data["allQuestionsCount"][2]["count"],
                solved=raw_data["matchedUser"]["submitStatsGlobal"]["acSubmissionNum"][
                    2
                ]["count"],
                solved_percent=raw_data["matchedUser"]["submitStatsGlobal"][
                    "acSubmissionNum"
                ][2]["count"]
                / raw_data["allQuestionsCount"][2]["count"]
                * 100,
                beats_percent=raw_data["matchedUser"]["problemsSolvedBeatsStats"][1][
                    "percentage"
                ],
            ),
            hard=LCProblemDifficultyModel(
                total=raw_data["allQuestionsCount"][3]["count"],
                solved=raw_data["matchedUser"]["submitStatsGlobal"]["acSubmissionNum"][
                    3
                ]["count"],
                solved_percent=raw_data["matchedUser"]["submitStatsGlobal"][
                    "acSubmissionNum"
                ][3]["count"]
                / raw_data["allQuestionsCount"][3]["count"]
                * 100,
                beats_percent=raw_data["matchedUser"]["problemsSolvedBeatsStats"][2][
                    "percentage"
                ],
            ),
        )

        # Cache the results
        await request.app.state.redis.set(
            "lc:solved", output.model_dump_json(), ex=60 * 60  # 1 hour
        )

        return output
    except requests.exceptions.ConnectionError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to LeetCode API Refused",
        )
    except requests.exceptions.JSONDecodeError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="LeetCode API Response Could Not Be Decoded",
        )
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=r.status_code,
            detail=f"{e}",
        )


@router.get("/languages/", response_model=list[LCLanguageStatModel])
async def get_problems_solved_per_language(request: Request, response: Response):
    url = "https://leetcode.com/graphql/"

    # Try to get the result from cache
    cached_result = await request.app.state.redis.get("lc:languages")
    if cached_result is not None:
        logger.info("Cache hit")
        return [LCLanguageStatModel(**language) for language in json.loads(cached_result)]

    query = """
        query languageStats($username: String!) {
            matchedUser(username: $username) {
                languageProblemCount {
                    languageName
                    problemsSolved
                }
            }
        }
    """

    request_body = {
        "query": query,
        "variables": {"username": Settings.LEETCODE_USERNAME},
        "operationName": "languageStats",
    }

    try:
        r = requests.post(url, json=request_body)
        response.status_code = r.status_code
        raw_data = r.json()["data"]["matchedUser"]["languageProblemCount"]

        # convert list of dicts to dict
        data_as_dict: dict[str, int] = {
            language["languageName"]: language["problemsSolved"]
            for language in raw_data
        }

        # combine 'Python' and 'Python3' into one entry
        if "Python" in data_as_dict and "Python3" in data_as_dict:
            data_as_dict["Python"] = max(
                data_as_dict["Python"], data_as_dict["Python3"]
            )
            data_as_dict.pop("Python3", None)

        # convert dict to list of models
        data_as_models: list[LCLanguageStatModel] = [
            LCLanguageStatModel(
                languageName=language, problemsSolved=data_as_dict[language]
            )
            for language in data_as_dict
        ]

        # sort list of models by problemsSolved
        output = sorted(
            data_as_models, key=lambda x: x.problemsSolved, reverse=True
        )

        # Cache the results
        await request.app.state.redis.set(
            "lc:languages", json.dumps([language.model_dump() for language in output]), ex=60 * 60  # 1 hour
        )

        return output
    except requests.exceptions.ConnectionError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to LeetCode API Refused",
        )
    except requests.exceptions.JSONDecodeError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="LeetCode API Response Could Not Be Decoded",
        )
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=r.status_code,
            detail=f"{e}",
        )


@router.get("/topics/")
async def get_problems_solved_per_topic(
    request: Request, response: Response, responseModel=LCTopicsSolvedModel
):
    url = "https://leetcode.com/graphql/"

    # Try to get the result from cache
    cached_result = await request.app.state.redis.get("lc:topics")
    if cached_result is not None:
        logger.info("Cache hit")
        return LCTopicsSolvedModel(**json.loads(cached_result))

    query = """
        query skillStats($username: String!) {
            matchedUser(username: $username) {
                tagProblemCounts {
                    advanced {
                        tagName
                        tagSlug
                        problemsSolved
                    }
                    intermediate {
                        tagName
                        tagSlug
                        problemsSolved
                    }
                    fundamental {
                        tagName
                        tagSlug
                        problemsSolved
                    }
                }
            }
        }
    """

    request_body = {
        "query": query,
        "variables": {"username": Settings.LEETCODE_USERNAME},
        "operationName": "skillStats",
    }

    try:
        r = requests.post(url, json=request_body)
        response.status_code = r.status_code
        raw_data = r.json()["data"]["matchedUser"]["tagProblemCounts"]

        output = LCTopicsSolvedModel(
            advanced=raw_data["advanced"],
            intermediate=raw_data["intermediate"],
            fundamental=raw_data["fundamental"],
        )

        # Cache the results
        await request.app.state.redis.set(
            "lc:topics", output.model_dump_json(), ex=60 * 60  # 1 hour
        )

        return output
    except requests.exceptions.ConnectionError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to LeetCode API Refused",
        )
    except requests.exceptions.JSONDecodeError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="LeetCode API Response Could Not Be Decoded",
        )
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=r.status_code,
            detail=f"{e}",
        )
