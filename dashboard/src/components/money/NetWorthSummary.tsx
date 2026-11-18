import type { ReactNode } from 'react';
import { isAxiosError } from 'axios';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getNetWorthTotal } from '@/lib/netWorthHistory';
import useQueryMoneyAccounts, {
	AccountTypeSummary,
	NetWorthSummaryData,
} from '../../hooks/useQueryMoneyAccounts';
import { useInvestmentSummary } from '../../hooks/useInvestmentSummary';
import NetWorthHistory from './NetWorthHistory';
import SensitiveValue from './SensitiveValue';

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
	isPrivate,
}: {
	accountType?: AccountTypeSummary;
	label?: string;
	isPrivate: boolean;
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
					<SensitiveValue hidden={isPrivate}>
						{formatter.format(accountType.totalDisplayBalance)}
					</SensitiveValue>
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
	isPrivate,
}: {
	accounts: NetWorthSummaryData;
	portfolio: { totalValue: number; oneDayChangeDollars: number };
	isPrivate: boolean;
}) {
	const totalNetWorth = getNetWorthTotal(accounts.data.accountTypeSummaries);
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
				<tr className="border-b font-bold">
					<td className="py-1 pr-4">
						<div className="flex justify-between gap-2">
							<span className="text-muted-foreground">
								Assets
							</span>
							<span className="text-success-foreground">
								<SensitiveValue hidden={isPrivate}>
									{formatter.format(totalAssets)}
								</SensitiveValue>
							</span>
						</div>
					</td>
					<td className="py-1 pr-4">
						<div className="flex justify-between gap-2">
							<span className="text-muted-foreground">
								Liabilities
							</span>
							<span className="text-destructive-foreground">
								<SensitiveValue hidden={isPrivate}>
									{formatter.format(totalLiabilities)}
								</SensitiveValue>
							</span>
						</div>
					</td>
					<SummaryCell label="Net Worth">
						<SensitiveValue hidden={isPrivate}>
							{formatter.format(totalNetWorth)}
						</SensitiveValue>
					</SummaryCell>
				</tr>
				<tr className="border-b">
					<AccountBalanceCell
						accountType={realEstate}
						isPrivate={isPrivate}
					/>
					<AccountBalanceCell
						accountType={mortgage}
						label="Mortgage"
						isPrivate={isPrivate}
					/>
					<SummaryCell label="Equity">
						<span className="font-medium">
							<SensitiveValue hidden={isPrivate}>
								{formatter.format(equity)}
							</SensitiveValue>
						</span>
					</SummaryCell>
				</tr>
				<tr className="border-b">
					<AccountBalanceCell
						accountType={investments}
						isPrivate={isPrivate}
					/>
					<AccountBalanceCell
						accountType={loans}
						isPrivate={isPrivate}
					/>
					<SummaryCell label="Portfolio">
						<span className="font-medium">
							<SensitiveValue hidden={isPrivate}>
								{formatter.format(portfolio.totalValue)}
							</SensitiveValue>
						</span>
					</SummaryCell>
				</tr>
				{Array.from({ length: remainingRowCount }, (_, index) => (
					<tr key={index} className="border-b">
						<AccountBalanceCell
							accountType={remainingAssets[index]}
							isPrivate={isPrivate}
						/>
						<AccountBalanceCell
							accountType={remainingLiabilities[index]}
							isPrivate={isPrivate}
						/>
						<td />
					</tr>
				))}
				<tr>
					<AccountBalanceCell
						accountType={cash}
						isPrivate={isPrivate}
					/>
					<AccountBalanceCell
						accountType={creditCards}
						isPrivate={isPrivate}
					/>
					<SummaryCell label="Liquid Funds">
						<span className="font-medium">
							<SensitiveValue hidden={isPrivate}>
								{formatter.format(liquidFunds)}
							</SensitiveValue>
						</span>
					</SummaryCell>
				</tr>
			</tbody>
		</table>
	);
}

function NetWorthSummary({
	accounts,
	isPrivate,
}: {
	accounts: ReturnType<typeof useQueryMoneyAccounts>;
	isPrivate: boolean;
}) {
	const portfolio = useInvestmentSummary();
	const error = accounts.error ?? portfolio.error;

	if (error) {
		const detail: unknown = isAxiosError<{ detail?: unknown }>(error)
			? error.response?.data?.detail
			: undefined;
		const message =
			typeof detail === 'string' && detail.trim()
				? detail
				: error.message;

		return (
			<div>
				<h2 className="mb-2 text-xl">Monarch Money unavailable</h2>
				<h3 className="break-words text-base">{message}</h3>
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
			isPrivate={isPrivate}
		/>
	);
}

function NetWorthSummaryCard({
	isPrivate,
	onTogglePrivacy,
}: {
	isPrivate: boolean;
	onTogglePrivacy: () => void;
}) {
	const accounts = useQueryMoneyAccounts();
	const currentNetWorth = accounts.data
		? getNetWorthTotal(accounts.data.data.accountTypeSummaries)
		: undefined;
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
					<button
						type="button"
						onClick={onTogglePrivacy}
						aria-label="Money privacy mode"
						aria-pressed={isPrivate}
						title={
							isPrivate
								? 'Show money amounts'
								: 'Hide money amounts'
						}
						className="ml-auto inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
					>
						{isPrivate ? (
							<EyeOff aria-hidden="true" className="size-4" />
						) : (
							<Eye aria-hidden="true" className="size-4" />
						)}
					</button>
				</div>
				<NetWorthHistory
					currentNetWorth={currentNetWorth}
					isPrivate={isPrivate}
				/>
				<details className="group/details mt-3 border-t pt-2">
					<summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
						Account details
						<ChevronDown
							aria-hidden="true"
							className="size-4 shrink-0 transition-transform group-open/details:rotate-180 motion-reduce:transition-none"
						/>
					</summary>
					<div className="min-w-0 overflow-x-auto pt-2">
						<NetWorthSummary
							accounts={accounts}
							isPrivate={isPrivate}
						/>
					</div>
				</details>
			</CardContent>
		</Card>
	);
}

export default NetWorthSummaryCard;
