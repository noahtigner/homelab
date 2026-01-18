import { Box, Link, Skeleton, Typography } from '../ui';
import { TrendingUpIcon, TrendingDownIcon } from '../icons';
import { StyledCard, StyledCardContent } from '../StyledCard';
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
			<Box
				display="flex"
				gap={0.5}
				style={{ marginBottom: 'calc(var(--spacing-unit) * 1)' }}
			>
				<Typography style={{ fontSize: '1.25rem' }} variant="h2">
					{formatter.format(data.totalValue)}
				</Typography>
				{isTrendingUp ? (
					<TrendingUpIcon color="success" fontSize={24} />
				) : (
					<TrendingDownIcon color="error" fontSize={24} />
				)}
			</Box>
			<Typography
				style={{
					fontSize: '1rem',
					wordBreak: 'break-word',
				}}
				variant="h3"
			>
				<span
					style={{
						backgroundColor: isTrendingUp
							? 'var(--color-success-bg)'
							: 'var(--color-error-bg)',
					}}
				>
					{formatter.format(data.oneDayChangeDollars)}{' '}
					{percentDisplayValue}
				</span>{' '}
				Today
			</Typography>
		</div>
	);
}

function InvestmentSummary() {
	const { isPending, error, data } = useInvestmentSummary();

	if (isPending) {
		return (
			<div>
				<Skeleton
					variant="text"
					width="100%"
					height={24}
					style={{ marginBottom: 'calc(var(--spacing-unit) * 1)' }}
				/>
				<Skeleton variant="text" width="100%" height={18} />
			</div>
		);
	}
	if (error) {
		return (
			<div>
				<Typography
					style={{
						fontSize: '1.25rem',
						marginBottom: 'calc(var(--spacing-unit) * 1)',
					}}
					variant="h2"
				>
					An unexpected error occurred
				</Typography>
				<Typography
					style={{
						fontSize: '1rem',
						wordBreak: 'break-word',
					}}
					variant="h3"
				>
					{error.message}
				</Typography>
			</div>
		);
	}
	return <InvestmentSummaryInner data={data} />;
}

function InvestmentSummaryCard() {
	return (
		<StyledCard>
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					style={{ marginBottom: 'calc(var(--spacing-unit) * 0.5)' }}
				>
					<img
						src="https://app.monarchmoney.com/butterfly-logo.svg"
						alt="Monarch Money"
						width={20}
						style={{ marginRight: 'calc(var(--spacing-unit) * 1)' }}
					/>
					<Link
						href="https://app.monarchmoney.com/accounts"
						target="_blank"
						rel="noreferrer"
						style={{ textDecoration: 'none', color: 'inherit' }}
					>
						<Typography
							style={{ fontSize: '1.25rem' }}
							variant="h2"
						>
							Portfolio
						</Typography>
					</Link>
				</Box>
				<InvestmentSummary />
			</StyledCardContent>
		</StyledCard>
	);
}

export default InvestmentSummaryCard;
