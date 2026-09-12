import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useQueryMoneyAccounts, {
	AccountTypeSummary,
	NetWorthSummaryData,
} from '../../hooks/useQueryMoneyAccounts';
import { useInvestmentSummary } from '../../hooks/useInvestmentSummary';

const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});

const normalizeAccountType = (value: string) => {
	return value
		.trim()
		.replace(/([a-z])([A-Z])/g, '$1_$2')
		.toLowerCase()
		.replace(/[\s-]+/g, '_');
};

const getAccountTypeSummary = (
	data: NetWorthSummaryData,
	...identifiers: string[]
) => {
	return data.data.accountTypeSummaries.find((accountType) => {
		const name = normalizeAccountType(accountType.type.name);
		const display = normalizeAccountType(accountType.type.display);

		return identifiers.includes(name) || identifiers.includes(display);
	});
};

function AccountBalanceCell({
	accountType,
	label = accountType?.type.display,
}: {
	accountType?: AccountTypeSummary;
	label?: string;
}) {
	if (!accountType || !label) {
		return <td />;
	}

	return (
		<td className="py-1 pr-4 align-top">
			<div className="flex justify-between gap-2">
				<span className="text-muted-foreground">{label}</span>
				<span
					className={
						accountType.type.group === 'asset'
							? 'text-success-foreground'
							: 'text-destructive-foreground'
					}
				>
					{formatter.format(accountType.totalDisplayBalance)}
				</span>
			</div>
		</td>
	);
}

function SummaryCell({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<td className="py-1 align-top">
			<div className="flex justify-between gap-2">
				<span className="text-muted-foreground">{label}</span>
				<div className="text-right">{children}</div>
			</div>
		</td>
	);
}

function NetWorthSummaryInner({
	accounts,
	portfolio,
}: {
	accounts: NetWorthSummaryData;
	portfolio: { totalValue: number; oneDayChangeDollars: number };
}) {
	const totalNetWorth = accounts.data.accountTypeSummaries.reduce(
		(acc, accountTypeSummary) =>
			acc +
			(accountTypeSummary.type.group === 'asset'
				? accountTypeSummary.totalDisplayBalance
				: -accountTypeSummary.totalDisplayBalance),
		0
	);
	const totalAssets = accounts.data.accountTypeSummaries
		.filter((accountType) => accountType.type.group === 'asset')
		.reduce(
			(total, accountType) => total + accountType.totalDisplayBalance,
			0
		);
	const totalLiabilities = accounts.data.accountTypeSummaries
		.filter((accountType) => accountType.type.group === 'liability')
		.reduce(
			(total, accountType) => total + accountType.totalDisplayBalance,
			0
		);
	const realEstate = getAccountTypeSummary(accounts, 'real_estate');
	const mortgage = getAccountTypeSummary(accounts, 'mortgage', 'mortgages');
	const investments = getAccountTypeSummary(
		accounts,
		'investment',
		'investments',
		'investment_account',
		'investment_accounts'
	);
	const loans = getAccountTypeSummary(accounts, 'loan', 'loans');
	const cash = getAccountTypeSummary(accounts, 'cash');
	const creditCards = getAccountTypeSummary(
		accounts,
		'credit_card',
		'credit_cards'
	);
	const equity =
		(realEstate?.totalDisplayBalance ?? 0) -
		(mortgage?.totalDisplayBalance ?? 0);
	const liquidFunds =
		(cash?.totalDisplayBalance ?? 0) -
		(creditCards?.totalDisplayBalance ?? 0);
	const shownAccountTypes = new Set(
		[realEstate, mortgage, investments, loans, cash, creditCards].filter(
			(accountType): accountType is AccountTypeSummary =>
				accountType !== undefined
		)
	);
	const remainingAssets = accounts.data.accountTypeSummaries
		.filter(
			(accountType) =>
				accountType.type.group === 'asset' &&
				!shownAccountTypes.has(accountType)
		)
		.sort((a, b) => b.totalDisplayBalance - a.totalDisplayBalance);
	const remainingLiabilities = accounts.data.accountTypeSummaries
		.filter(
			(accountType) =>
				accountType.type.group === 'liability' &&
				!shownAccountTypes.has(accountType)
		)
		.sort((a, b) => b.totalDisplayBalance - a.totalDisplayBalance);
	const remainingRowCount = Math.max(
		remainingAssets.length,
		remainingLiabilities.length
	);

	return (
		<table className="w-full text-sm">
			<tbody>
				<tr className="border-b">
					<td className="py-1 pr-4">
						<div className="flex justify-between gap-2">
							<span className="text-muted-foreground">
								Assets
							</span>
							<span className="text-success-foreground">
								{formatter.format(totalAssets)}
							</span>
						</div>
					</td>
					<td className="py-1 pr-4">
						<div className="flex justify-between gap-2">
							<span className="text-muted-foreground">
								Liabilities
							</span>
							<span className="text-destructive-foreground">
								{formatter.format(totalLiabilities)}
							</span>
						</div>
					</td>
					<SummaryCell label="Net Worth">
						<span className="font-medium">
							{formatter.format(totalNetWorth)}
						</span>
					</SummaryCell>
				</tr>
				<tr className="border-b">
					<AccountBalanceCell accountType={realEstate} />
					<AccountBalanceCell
						accountType={mortgage}
						label="Mortgage"
					/>
					<SummaryCell label="Equity">
						<span className="font-medium">
							{formatter.format(equity)}
						</span>
					</SummaryCell>
				</tr>
				<tr className="border-b">
					<AccountBalanceCell accountType={investments} />
					<AccountBalanceCell accountType={loans} />
					<SummaryCell label="Portfolio">
						<span className="font-medium">
							{formatter.format(portfolio.totalValue)}
						</span>
					</SummaryCell>
				</tr>
				{Array.from({ length: remainingRowCount }, (_, index) => (
					<tr key={index} className="border-b">
						<AccountBalanceCell
							accountType={remainingAssets[index]}
						/>
						<AccountBalanceCell
							accountType={remainingLiabilities[index]}
						/>
						<td />
					</tr>
				))}
				<tr>
					<AccountBalanceCell accountType={cash} />
					<AccountBalanceCell accountType={creditCards} />
					<SummaryCell label="Liquid Funds">
						<span className="font-medium">
							{formatter.format(liquidFunds)}
						</span>
					</SummaryCell>
				</tr>
			</tbody>
		</table>
	);
}

function NetWorthSummary() {
	const accounts = useQueryMoneyAccounts();
	const portfolio = useInvestmentSummary();
	const error = accounts.error ?? portfolio.error;

	if (error) {
		return (
			<div>
				<h2 className="mb-2 text-xl">An unexpected error occurred</h2>
				<h3 className="break-words text-base">{error.message}</h3>
			</div>
		);
	}
	if (
		accounts.isPending ||
		portfolio.isPending ||
		!accounts.data ||
		!portfolio.data
	) {
		return (
			<div className="space-y-2">
				{Array.from({ length: 4 }, (_, index) => (
					<Skeleton key={index} className="h-8 w-full" />
				))}
			</div>
		);
	}
	return (
		<NetWorthSummaryInner
			accounts={accounts.data}
			portfolio={portfolio.data}
		/>
	);
}

function NetWorthSummaryCard() {
	return (
		<Card>
			<CardContent>
				<div className="mb-1 flex items-center">
					<img
						src="https://app.monarchmoney.com/butterfly-logo.svg"
						alt="Monarch Money"
						width={20}
						className="mr-2"
					/>
					<a
						href="https://app.monarchmoney.com/accounts"
						target="_blank"
						rel="noreferrer"
						className="no-underline text-inherit hover:text-primary"
					>
						<h2 className="text-xl">Monarch Money</h2>
					</a>
				</div>
				<NetWorthSummary />
			</CardContent>
		</Card>
	);
}

export default NetWorthSummaryCard;
