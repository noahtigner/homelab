from typing import Optional

from pydantic import BaseModel


class MoneyPerformance(BaseModel):
    totalValue: float
    oneDayChangeDollars: float


class MoneyPortfolio(BaseModel):
    performance: MoneyPerformance


class MoneyPortfolioData(BaseModel):
    portfolio: MoneyPortfolio


class MoneyPortfolioIncoming(BaseModel):
    data: MoneyPortfolioData


class MoneyPortfolioOutgoing(MoneyPerformance):
    pass


class MoneyAccountInstitution(BaseModel):
    id: str
    name: str


class MoneyAccountType(BaseModel):
    name: str
    display: str


class MoneyAccount(BaseModel):
    id: str
    syncDisabled: bool
    isHidden: bool
    isAsset: bool
    includeInNetWorth: bool
    type: MoneyAccountType
    displayName: str
    displayBalance: float
    signedBalance: float
    updatedAt: str
    icon: str
    logoUrl: Optional[str]
    includeBalanceInNetWorth: bool
    institution: Optional[MoneyAccountInstitution]


class MoneyAccountSummaryType(BaseModel):
    display: str
    group: str
    name: str


class MoneyAccountSummary(BaseModel):
    type: MoneyAccountSummaryType
    accounts: list[MoneyAccount]
    totalDisplayBalance: float


class MoneyAccountsData(BaseModel):
    accountTypeSummaries: list[MoneyAccountSummary]


class MoneyAccountsResponse(BaseModel):
    data: MoneyAccountsData
