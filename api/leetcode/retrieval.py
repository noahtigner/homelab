import logging

import requests
from fastapi import HTTPException, Request, status

from api.config import Settings
from api.leetcode.models import (
    LCLanguagesResponse,
    LCLanguageStatModel,
    LCProblemDifficultyModel,
    LCProblemsSolvedModel,
    LCTopicsSolvedModel,
)
from api.utils.cache import cache

logger = logging.getLogger(__name__)


@cache("lc:solved", LCProblemsSolvedModel, ttl=60 * 60)
async def retrieve_problems_solved(request: Request) -> LCProblemsSolvedModel:
    url = "https://leetcode.com/graphql/"

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
        raw_data = r.json()["data"]

        return LCProblemsSolvedModel(
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


@cache("lc:languages", LCLanguagesResponse, ttl=60 * 60)
async def retrieve_languages(request: Request) -> LCLanguagesResponse:
    url = "https://leetcode.com/graphql/"

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
        r.raise_for_status()
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
        sorted_languages = sorted(
            data_as_models, key=lambda x: x.problemsSolved, reverse=True
        )

        return LCLanguagesResponse(languages=sorted_languages)
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


@cache("lc:topics", LCTopicsSolvedModel, ttl=60 * 60)
async def retrieve_topics(request: Request) -> LCTopicsSolvedModel:
    url = "https://leetcode.com/graphql/"

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
        r.raise_for_status()
        raw_data = r.json()["data"]["matchedUser"]["tagProblemCounts"]

        return LCTopicsSolvedModel(
            advanced=raw_data["advanced"],
            intermediate=raw_data["intermediate"],
            fundamental=raw_data["fundamental"],
        )
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
