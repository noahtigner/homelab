import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvestmentSummary } from '../../hooks/useInvestmentSummary';
import type { z } from 'zod';
import type { investmentSummaryDataSchema } from '../../types/schemas';

type InvestmentSummaryData = z.infer<typeof investmentSummaryDataSchema>;

const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});

function InvestmentSummaryInner({ data }: { data: InvestmentSummaryData }) {
	const isTrendingUp = data.oneDayChangeDollars >= 0;
	const changePercent = (data.oneDayChangeDollars / data.totalValue) * 100;
	const roundedChangePercent = (Math.round(changePercent * 10) / 10).toFixed(
		1
	);
	const percentDisplayValue = `(${roundedChangePercent}%)`;

	return (
		<div>
			<div className="mb-2 flex items-center gap-1">
				<h2 className="text-xl">{formatter.format(data.totalValue)}</h2>
				{isTrendingUp ? (
					<TrendingUp size={24} className="text-success-foreground" />
				) : (
					<TrendingDown
						size={24}
						className="text-destructive-foreground"
					/>
				)}
			</div>
			<h3 className="break-words text-base">
				<span
					className={
						isTrendingUp
							? 'text-success-foreground'
							: 'text-destructive-foreground'
					}
				>
					{formatter.format(data.oneDayChangeDollars)}{' '}
					{percentDisplayValue}
				</span>{' '}
				<span className="text-muted-foreground">Today</span>
			</h3>
		</div>
	);
}

function InvestmentSummary() {
	const { isPending, error, data } = useInvestmentSummary();

	if (isPending) {
		return (
			<div>
				<Skeleton className="mb-2 h-6 w-full" />
				<Skeleton className="h-5 w-full" />
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
	return <InvestmentSummaryInner data={data} />;
}

function InvestmentSummaryCard() {
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
						<h2 className="text-xl">Portfolio</h2>
					</a>
				</div>
				<InvestmentSummary />
			</CardContent>
		</Card>
	);
}

export default InvestmentSummaryCard;
