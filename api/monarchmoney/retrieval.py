import json
import logging

import requests
from fastapi import HTTPException, Request, status

from api.config import Settings
from api.monarchmoney.models import (
    MoneyAccountsResponse,
    MoneyPortfolioIncoming,
    MoneyPortfolioOutgoing,
)
from api.utils.cache import cache

logger = logging.getLogger(__name__)

MONARCH_GRAPHQL_ENDPOINT = "https://api.monarch.com/graphql"


@cache("money:portfolio", MoneyPortfolioOutgoing, ttl=60 * 5)
async def retrieve_portfolio(request: Request) -> MoneyPortfolioOutgoing:
    token = Settings.MONARCHMONEY_API_TOKEN
    body = {
        "operationName": "Web_GetInvestmentsDashboardCard",
        "variables": {},
        "query": """
            query Web_GetInvestmentsDashboardCard {
                portfolio {
                    performance {
                        totalValue
                        oneDayChangeDollars
                    }
                }
            }
        """,
    }

    try:
        r = requests.post(
            MONARCH_GRAPHQL_ENDPOINT,
            data=json.dumps(body),
            headers={
                "Authorization": f"Token {token}",
                "Content-Type": "application/json",
            },
        )
        r.raise_for_status()
        data = MoneyPortfolioIncoming(**r.json())
        return MoneyPortfolioOutgoing(
            totalValue=data.data.portfolio.performance.totalValue,
            oneDayChangeDollars=data.data.portfolio.performance.oneDayChangeDollars,
        )
    except (requests.exceptions.ConnectionError, requests.exceptions.HTTPError) as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Connection to Monarch Money Refused: {e}",
        )


@cache("money:accounts", MoneyAccountsResponse, ttl=60 * 5)
async def retrieve_accounts(request: Request) -> MoneyAccountsResponse:
    token = Settings.MONARCHMONEY_API_TOKEN
    body = {
        "operationName": "Web_GetAccountsPage",
        "variables": {},
        "query": """
            query Web_GetAccountsPage {
                accountTypeSummaries {
                    type {
                        name
                        display
                        group
                    }
                    accounts {
                        id
                        ...AccountsListFields
                    }
                    totalDisplayBalance
                }
            }
            fragment AccountsListFields on Account {
                id
                syncDisabled
                isHidden
                isAsset
                includeInNetWorth
                type {
                    name
                    display
                }
                ...AccountListItemFields
            }
            fragment AccountListItemFields on Account {
                id
                displayName
                displayBalance
                signedBalance
                updatedAt
                syncDisabled
                icon
                logoUrl
                isHidden
                isAsset
                includeInNetWorth
                includeBalanceInNetWorth
                institution {
                    id
                    ...InstitutionStatusTooltipFields
                }
            }
            fragment InstitutionStatusTooltipFields on Institution {
                id
                name
            }
        """,
    }

    try:
        r = requests.post(
            MONARCH_GRAPHQL_ENDPOINT,
            data=json.dumps(body),
            headers={
                "Authorization": f"Token {token}",
                "Content-Type": "application/json",
            },
        )
        r.raise_for_status()

        return MoneyAccountsResponse(**r.json())
    except (requests.exceptions.ConnectionError, requests.exceptions.HTTPError) as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Connection to Monarch Money Refused: {e}",
        )
