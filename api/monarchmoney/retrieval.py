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
MONARCH_USER_AGENT = (
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:160.0) Gecko/20100101 Firefox/160.0"
)


def _post_graphql(body: dict) -> dict:
    """Send a query with the saved browser session and matching CSRF token."""
    try:
        response = requests.post(
            MONARCH_GRAPHQL_ENDPOINT,
            json=body,
            cookies={
                "session_id": Settings.MONARCHMONEY_SESSION_ID,
                "csrftoken": Settings.MONARCHMONEY_CSRF_TOKEN,
            },
            headers={
                "X-CSRFToken": Settings.MONARCHMONEY_CSRF_TOKEN,
                "Origin": "https://app.monarch.com",
                "User-Agent": MONARCH_USER_AGENT,
                "Content-Type": "application/json",
            },
            timeout=(5, 30),
        )
        response.raise_for_status()
    except requests.exceptions.Timeout:
        detail = "Monarch Money request timed out. Try again later."
    except requests.exceptions.HTTPError as error:
        upstream = error.response
        code = upstream.status_code if upstream is not None else None
        if code == 401:
            detail = (
                "Monarch authentication needs renewal. Replace the session and "
                "CSRF secrets and recreate the API container."
            )
        elif code == 403:
            try:
                payload = upstream.json()
                upstream_detail = (
                    payload.get("detail") if isinstance(payload, dict) else None
                )
            except ValueError:
                upstream_detail = None
            if isinstance(upstream_detail, str) and upstream_detail.startswith(
                "CSRF Failed:"
            ):
                detail = (
                    "Monarch rejected CSRF validation. Check that the session and "
                    "CSRF credentials come from the same browser session."
                )
            else:
                detail = (
                    "Monarch rejected the request. Check the session credentials "
                    "and browser-style request headers."
                )
        else:
            detail = "Monarch Money returned an upstream HTTP error. Try again later."
    except requests.exceptions.RequestException:
        detail = "Could not connect to Monarch Money. Try again later."
    else:
        return response.json()

    logger.warning("Monarch operation %s failed: %s", body["operationName"], detail)
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=detail,
    ) from None


@cache("money:portfolio", MoneyPortfolioOutgoing, ttl=60 * 5)
async def retrieve_portfolio(request: Request) -> MoneyPortfolioOutgoing:
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

    data = MoneyPortfolioIncoming(**_post_graphql(body))
    return MoneyPortfolioOutgoing(
        totalValue=data.data.portfolio.performance.totalValue,
        oneDayChangeDollars=data.data.portfolio.performance.oneDayChangeDollars,
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

    response = MoneyAccountsResponse(**_post_graphql(body))
    _split_mortgage_from_loans(response)
    return response
