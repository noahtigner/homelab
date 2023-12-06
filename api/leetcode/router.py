import requests
from fastapi import APIRouter, HTTPException, Response, status

from api.config import Settings
from api.leetcode.models import LCProblemDifficultyModel, LCProblemsSolvedModel

router = APIRouter(
    prefix='/leetcode',
    tags=['LeetCode'],
)

@router.get('/solved', response_model=LCProblemsSolvedModel)
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
        raw_data = r.json()['data']
        response_data = LCProblemsSolvedModel(
            all=LCProblemDifficultyModel(
                total=raw_data['allQuestionsCount'][0]['count'],
                solved=raw_data['matchedUser']['submitStatsGlobal']['acSubmissionNum'][0]['count'],
                solved_percent=raw_data['matchedUser']['submitStatsGlobal']['acSubmissionNum'][0]['count'] / raw_data['allQuestionsCount'][0]['count'] * 100
            ),
            easy=LCProblemDifficultyModel(
                total=raw_data['allQuestionsCount'][1]['count'],
                solved=raw_data['matchedUser']['submitStatsGlobal']['acSubmissionNum'][1]['count'],
                solved_percent=raw_data['matchedUser']['submitStatsGlobal']['acSubmissionNum'][1]['count'] / raw_data['allQuestionsCount'][1]['count'] * 100,
                beats_percent=raw_data['matchedUser']['problemsSolvedBeatsStats'][0]['percentage']
            ),
            medium=LCProblemDifficultyModel(
                total=raw_data['allQuestionsCount'][2]['count'],
                solved=raw_data['matchedUser']['submitStatsGlobal']['acSubmissionNum'][2]['count'],
                solved_percent=raw_data['matchedUser']['submitStatsGlobal']['acSubmissionNum'][2]['count'] / raw_data['allQuestionsCount'][2]['count'] * 100,
                beats_percent=raw_data['matchedUser']['problemsSolvedBeatsStats'][1]['percentage']
            ),
            hard=LCProblemDifficultyModel(
                total=raw_data['allQuestionsCount'][3]['count'],
                solved=raw_data['matchedUser']['submitStatsGlobal']['acSubmissionNum'][3]['count'],
                solved_percent=raw_data['matchedUser']['submitStatsGlobal']['acSubmissionNum'][3]['count'] / raw_data['allQuestionsCount'][3]['count'] * 100,
                beats_percent=raw_data['matchedUser']['problemsSolvedBeatsStats'][2]['percentage']
            )
        )
        return response_data
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
