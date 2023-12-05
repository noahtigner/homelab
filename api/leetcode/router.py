import requests
from fastapi import APIRouter, HTTPException, Response, status

from api.config import Settings

router = APIRouter(
    prefix='/leetcode',
    tags=['LeetCode'],
)

@router.get('/solved')
def get_problems_solved(response: Response):
    url = f'https://leetcode.com/graphql/'

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
        "variables": {
            "username": Settings.LEETCODE_USERNAME
        },
        "operationName": "userProblemsSolved"
    }

    try:
        r = requests.post(url, json=request_body)
        response.status_code = r.status_code
        return r.json()
    except requests.exceptions.ConnectionError as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to LeetCode API Refused"
        )

@router.get('/languages')
def get_problems_solved_per_language(response: Response):
    url = f'https://leetcode.com/graphql/'

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
        "variables": {
            "username": Settings.LEETCODE_USERNAME
        },
        "operationName": "languageStats"
    }

    try:
        r = requests.post(url, json=request_body)
        response.status_code = r.status_code
        raw_data = r.json()['data']['matchedUser']['languageProblemCount']
        sorted_data = sorted(raw_data, key=lambda x: x['problemsSolved'], reverse=True)
        return sorted_data
    except requests.exceptions.ConnectionError as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to LeetCode API Refused"
        )
