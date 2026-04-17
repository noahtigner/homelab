import json
import logging

import requests
from fastapi import HTTPException, Request, status

from api.config import Settings
from api.monarchmoney.models import (
    MoneyAccountsResponse,
    MoneyAccountSummary,
    MoneyAccountSummaryType,
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


def _split_mortgage_from_loans(response: MoneyAccountsResponse) -> None:
    """Split mortgage accounts out of the "loan" account type summary into a
    separate "mortgage" summary. Mutates the response in place."""
    summaries = response.data.accountTypeSummaries
    loan_summary = next(
        (s for s in summaries if s.type.name == "loan"),
        None,
    )
    if loan_summary is None:
        return

    mortgage_accounts = [
        acc
        for acc in loan_summary.accounts
        if "mortgage" in acc.displayName.lower()
        or (acc.institution and "mortgage" in acc.institution.name.lower())
    ]
    if not mortgage_accounts:
        return

    remaining_loans = [
        acc for acc in loan_summary.accounts if acc not in mortgage_accounts
    ]
    loan_summary.accounts = remaining_loans
    loan_summary.totalDisplayBalance = sum(
        acc.displayBalance for acc in remaining_loans
    )

    mortgage_summary = MoneyAccountSummary(
        type=MoneyAccountSummaryType(
            display="Mortgages",
            group="liability",
            name="mortgage",
        ),
        accounts=mortgage_accounts,
        totalDisplayBalance=sum(acc.displayBalance for acc in mortgage_accounts),
    )
    # Insert the mortgage summary right after the loan summary so related
    # liabilities stay grouped together.
    loan_index = summaries.index(loan_summary)
    summaries.insert(loan_index + 1, mortgage_summary)


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

        response = MoneyAccountsResponse(**r.json())
        _split_mortgage_from_loans(response)
        return response
    except (requests.exceptions.ConnectionError, requests.exceptions.HTTPError) as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Connection to Monarch Money Refused: {e}",
        )
