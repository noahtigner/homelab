import logging
from datetime import date

from fastapi import APIRouter, HTTPException, Request

from api.monarchmoney.models import (
    MoneyAccountsResponse,
    MoneyNetWorthHistoryResponse,
    MoneyPortfolioOutgoing,
)
from api.monarchmoney.retrieval import (
    retrieve_accounts,
    retrieve_net_worth_history,
    retrieve_portfolio,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/money",
    tags=["Monarch Money"],
)


@router.get("/portfolio/", response_model=MoneyPortfolioOutgoing)
async def get_portfolio(request: Request):
    return await retrieve_portfolio(request)


@router.get("/accounts/", response_model=MoneyAccountsResponse)
async def get_accounts(request: Request):
    return await retrieve_accounts(request)


@router.get("/net-worth-history/", response_model=MoneyNetWorthHistoryResponse)
async def get_net_worth_history(
    request: Request, end_date: date, start_date: date | None = None
):
    if start_date is not None and start_date > end_date:
        raise HTTPException(
            status_code=422, detail="start_date must be on or before end_date"
        )
    return await retrieve_net_worth_history(
        request,
        end_date=end_date.isoformat(),
        start_date=start_date.isoformat() if start_date is not None else None,
    )
