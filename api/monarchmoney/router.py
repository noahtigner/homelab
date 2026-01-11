import logging

from fastapi import APIRouter, Request

from api.monarchmoney.models import MoneyAccountsResponse, MoneyPortfolioOutgoing
from api.monarchmoney.retrieval import retrieve_accounts, retrieve_portfolio

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
