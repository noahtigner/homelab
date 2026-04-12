import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useQueryMoneyAccounts from '../../hooks/useQueryMoneyAccounts';

const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});

function EquitySummaryInner({
	homeValue,
	mortgageBalance,
}: {
	homeValue: number;
	mortgageBalance: number;
}) {
	const totalEquity = homeValue - mortgageBalance;

	return (
		<div>
			<h2 className="mb-2 text-xl">{formatter.format(totalEquity)}</h2>
			<h3 className="break-words text-base">
				<span className="text-muted-foreground">Home Value</span>{' '}
				<span className="text-success-foreground">
					{formatter.format(homeValue)}
				</span>
			</h3>
			<h3 className="break-words pt-2 text-base">
				<span className="text-muted-foreground">Mortgage</span>{' '}
				<span className="text-destructive-foreground">
					{formatter.format(mortgageBalance)}
				</span>
			</h3>
		</div>
	);
}

function EquitySummary() {
	const { isPending, error, data } = useQueryMoneyAccounts();

	if (isPending) {
		return (
			<div>
				<Skeleton className="mb-2 h-6 w-full" />
				{Array(2)
					.fill(0)
					.map((_, i) => (
						<Skeleton key={i} className="h-5 w-full" />
					))}
			</div>
		);
	}
	if (error) {
		return (
			<div>
				<h2 className="mb-2 text-xl">An unexpected error occurred</h2>
				<h3 className="break-words text-base">{error.message}</h3>
			</div>
		);
	}

	const homeValue =
		data.data.accountTypeSummaries.find(
			(accType) => accType.type.name === 'real_estate'
		)?.totalDisplayBalance || 0;
	const loanAccounts =
		data.data.accountTypeSummaries.find(
			(accType) => accType.type.name === 'loan'
		)?.accounts || [];
	const mortgageAccounts = loanAccounts.filter(
		(acc) =>
			acc.displayName.toLowerCase().includes('mortgage') ||
			acc.institution?.name.toLowerCase().includes('mortgage')
	);
	const mortgageBalance: number = mortgageAccounts.reduce(
		(acc, accType) => acc + accType.displayBalance,
		0
	);

	return (
		<EquitySummaryInner
			homeValue={homeValue}
			mortgageBalance={mortgageBalance}
		/>
	);
}

function EquitySummaryCard() {
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
						<h2 className="text-xl">Equity</h2>
					</a>
				</div>
				<EquitySummary />
			</CardContent>
		</Card>
	);
}

export default EquitySummaryCard;
