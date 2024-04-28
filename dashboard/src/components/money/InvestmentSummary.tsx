import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Box, Link, Skeleton, Typography, useTheme } from '@mui/material';
import {
	TrendingUp as TrendingUpIcon,
	TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { StyledCard, StyledCardContent } from '../StyledCard';

interface InvestmentSummaryData {
	totalValue: number;
	oneDayChangeDollars: number;
}

const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});

function InvestmentSummaryInner({ data }: { data: InvestmentSummaryData }) {
	const theme = useTheme();

	const isTrendingUp = data.oneDayChangeDollars >= 0;
	const changePercent = (data.oneDayChangeDollars / data.totalValue) * 100;
	const roundedChangePercent = (Math.round(changePercent * 10) / 10).toFixed(
		1
	);
	const percentDisplayValue = `(${roundedChangePercent}%)`;

	return (
		<div>
			<Box
				sx={{
					display: 'flex',
					gap: 0.5,
					marginBottom: theme.spacing(1),
				}}
			>
				<Typography
					sx={{
						fontSize: '1.25rem',
					}}
					variant="h2"
				>
					{formatter.format(data.totalValue)}
				</Typography>
				{isTrendingUp ? (
					<TrendingUpIcon color="success" sx={{ fontSize: 24 }} />
				) : (
					<TrendingDownIcon color="error" sx={{ fontSize: 24 }} />
				)}
			</Box>
			<Typography
				sx={{
					fontSize: '1rem',
					wordBreak: 'break-word',
				}}
				variant={'h3'}
			>
				<span
					style={{
						backgroundColor: isTrendingUp
							? theme.palette.success.main
							: theme.palette.error.main,
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
	const { isPending, error, data } = useQuery({
		queryKey: ['investmentSummary'],
		refetchInterval: 1000 * 60 * 15, // 15 minutes
		queryFn: () =>
			axios
				.get<InvestmentSummaryData>(`/money/portfolio/`)
				.then((res) => res.data),
	});

	if (isPending) {
		return (
			<div>
				<Skeleton
					variant="text"
					width="100%"
					height={24}
					sx={{ marginBottom: 1 }}
				/>
				<Skeleton variant="text" width="100%" height={18} />
			</div>
		);
	}
	if (error) {
		return (
			<div>
				<Typography
					sx={{
						fontSize: '1.25rem',
						marginBottom: 1,
					}}
					variant="h2"
				>
					An unexpected error occurred
				</Typography>
				<Typography
					sx={{
						fontSize: '1rem',
						wordBreak: 'break-word',
					}}
					variant={'h3'}
				>
					{error.message}
				</Typography>
			</div>
		);
	}
	return <InvestmentSummaryInner data={data} />;
}

function InvestmentSummaryCard() {
	const theme = useTheme();
	return (
		<StyledCard variant="outlined">
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					sx={{ marginBottom: theme.spacing(0.5) }}
				>
					<img
						src="https://app.monarchmoney.com/butterfly-logo.svg"
						alt="Monarch Money"
						width={20}
						style={{ marginRight: theme.spacing(1) }}
					/>
					<Link
						href="https://app.monarchmoney.com/accounts"
						target="_blank"
						rel="noreferrer"
						sx={{ textDecoration: 'none', color: 'inherit' }}
					>
						<Typography
							sx={{
								fontSize: '1.25rem',
							}}
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
