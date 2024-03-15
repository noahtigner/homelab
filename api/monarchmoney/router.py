import json
import logging
from urllib.parse import quote

import requests
from fastapi import APIRouter, HTTPException, Request, status

from api.config import Settings

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/money",
    tags=["Monarch Money"],
)


@router.get("/portfolio/")
async def get_portfolio(request: Request):
    token = await request.app.state.redis.get('monarchmoney_token')
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Monarch Money Token Not Found",
        )
    token = token.decode('utf-8')

    body = {
        "operationName": "Web_GetInvestmentsDashboardCard",
        "variables": {},
        "query": "query Web_GetInvestmentsDashboardCard {\n  portfolio {\n    performance {\n      totalValue\n      oneDayChangeDollars\n      topMovers {\n        id\n        name\n        ticker\n        oneDayChangePercent\n        currentPrice\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}"
    }

    try:
        r = requests.post(
            'https://api.monarchmoney.com/graphql',
            data=json.dumps(body),
            headers={
                'Authorization': f'Token {token}',
                'Content-Type': 'application/json',
            }

        )
        r.raise_for_status()
        raw_data = r.json()

        return raw_data
    except requests.exceptions.ConnectionError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to Monarch Money Refused",
        )

@router.get("/accounts/")
async def get_accounts(request: Request):
    token = await request.app.state.redis.get('monarchmoney_token')
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Monarch Money Token Not Found",
        )
    token = token.decode('utf-8')

    body = {
        "operationName": "Web_GetAccountsPage",
        "variables": {},
        "query": "query Web_GetAccountsPage {\n  accountTypeSummaries {\n    type {\n      name\n      display\n      group\n    }\n    accounts {\n      id\n      ...AccountsListFields\n    }\n    totalDisplayBalance\n  }\n  householdPreferences {\n    id\n    accountGroupOrder\n  }\n}\n\nfragment AccountsListFields on Account {\n  id\n  syncDisabled\n  isHidden\n  isAsset\n  includeInNetWorth\n  order\n  type {\n    name\n    display\n  }\n  ...AccountListItemFields\n  __typename\n}\n\nfragment AccountListItemFields on Account {\n  id\n  displayName\n  displayBalance\n  signedBalance\n  updatedAt\n  syncDisabled\n  icon\n  logoUrl\n  isHidden\n  isAsset\n  includeInNetWorth\n  includeBalanceInNetWorth\n  displayLastUpdatedAt\n  ...AccountMaskFields\n  credential {\n    id\n    updateRequired\n    dataProvider\n    disconnectedFromDataProviderAt\n    __typename\n  }\n  institution {\n    id\n    ...InstitutionStatusTooltipFields\n    __typename\n  }\n  __typename\n}\n\nfragment AccountMaskFields on Account {\n  id\n  mask\n  subtype {\n    display\n    __typename\n  }\n  __typename\n}\n\nfragment InstitutionStatusTooltipFields on Institution {\n  id\n  logo\n  name\n  status\n  plaidStatus\n  hasIssuesReported\n  url\n  hasIssuesReportedMessage\n  transactionsStatus\n  balanceStatus\n  __typename\n}",
    }

    try:
        r = requests.post(
            'https://api.monarchmoney.com/graphql',
            data=json.dumps(body),
            headers={
                'Authorization': f'Token {token}',
                'Content-Type': 'application/json',
            }

        )
        r.raise_for_status()
        raw_data = r.json()

        return raw_data
    except requests.exceptions.ConnectionError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connection to Monarch Money Refused",
        )
