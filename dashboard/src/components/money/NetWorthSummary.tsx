import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import useQueryMoneyAccounts, {
	AccountTypeSummary,
	NetWorthSummaryData,
} from '../../hooks/useQueryMoneyAccounts';

const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});

const isAsset = (accountType: AccountTypeSummary): boolean => {
	return accountType.type.group === 'asset';
};

function NetWorthSummaryInner({ data }: { data: NetWorthSummaryData }) {
	const totalNetWorth = data.data.accountTypeSummaries.reduce(
		(acc, accountTypeSummary) =>
			acc +
			(accountTypeSummary.type.group === 'asset'
				? accountTypeSummary.totalDisplayBalance
				: -accountTypeSummary.totalDisplayBalance),
		0
	);

	return (
		<div>
			<h2 className="mb-2 text-xl">{formatter.format(totalNetWorth)}</h2>
			<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
				{['asset', 'liability'].map((group) => (
					<div key={group}>
						<h4 className="flex justify-between text-xs">
							<span className="text-muted-foreground">
								{group === 'asset' ? 'Assets' : 'Liabilities'}
							</span>
							<span
								className={
									group === 'asset'
										? 'text-success-foreground'
										: 'text-destructive-foreground'
								}
							>
								{formatter.format(
									data.data.accountTypeSummaries
										.filter(
											(accountTypeSummary) =>
												accountTypeSummary.type
													.group === group
										)
										.reduce(
											(acc, accountTypeSummary) =>
												acc +
												accountTypeSummary.totalDisplayBalance,
											0
										)
								)}
							</span>
						</h4>
						<Separator className="mt-1" />
						{data.data.accountTypeSummaries
							.filter(
								(accountTypeSummary) =>
									accountTypeSummary.type.group === group
							)
							.sort(
								(a, b) =>
									b.totalDisplayBalance -
									a.totalDisplayBalance
							)
							.map((accountTypeSummary) => (
								<p
									key={accountTypeSummary.type.name}
									className="flex justify-between text-xs"
								>
									<span className="text-muted-foreground">
										{accountTypeSummary.type.display}
									</span>
									<span
										className={
											isAsset(accountTypeSummary)
												? 'text-success-foreground'
												: 'text-destructive-foreground'
										}
									>
										{formatter.format(
											accountTypeSummary.totalDisplayBalance
										)}
									</span>
								</p>
							))}
					</div>
				))}
			</div>
		</div>
	);
}

function NetWorthSummary() {
	const { isPending, error, data } = useQueryMoneyAccounts();

	if (isPending) {
		return (
			<div>
				<Skeleton className="mb-2 h-6 w-full" />
				{Array(4)
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
	return <NetWorthSummaryInner data={data} />;
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
						<h2 className="text-xl">Net Worth</h2>
					</a>
				</div>
				<NetWorthSummary />
			</CardContent>
		</Card>
	);
}

export default NetWorthSummaryCard;
