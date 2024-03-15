import json
import logging

import requests
from fastapi import APIRouter, HTTPException, Request, status

from api.monarchmoney.models import (
    MoneyAccountsResponse,
    MoneyPortfolioIncoming,
    MoneyPortfolioOutgoing,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/money",
    tags=["Monarch Money"],
)


@router.get("/portfolio/", response_model=MoneyPortfolioOutgoing)
async def get_portfolio(request: Request):
    token = await request.app.state.redis.get("monarchmoney_token")
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Monarch Money Token Not Found",
        )
    token = token.decode("utf-8")

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
            "https://api.monarchmoney.com/graphql",
            data=json.dumps(body),
            headers={
                "Authorization": f"Token {token}",
                "Content-Type": "application/json",
            },
        )
        r.raise_for_status()
        data = MoneyPortfolioIncoming(**r.json())
        response_data = MoneyPortfolioOutgoing(
            totalValue=data.data.portfolio.performance.totalValue,
            oneDayChangeDollars=data.data.portfolio.performance.oneDayChangeDollars,
        )

        return response_data
    except requests.exceptions.ConnectionError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to Monarch Money Refused",
        )


@router.get("/accounts/", response_model=MoneyAccountsResponse)
async def get_accounts(request: Request):
    token = await request.app.state.redis.get("monarchmoney_token")
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Monarch Money Token Not Found",
        )
    token = token.decode("utf-8")

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
            "https://api.monarchmoney.com/graphql",
            data=json.dumps(body),
            headers={
                "Authorization": f"Token {token}",
                "Content-Type": "application/json",
            },
        )
        r.raise_for_status()

        data = MoneyAccountsResponse(**r.json())
        return data
    except requests.exceptions.ConnectionError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to Monarch Money Refused",
        )
