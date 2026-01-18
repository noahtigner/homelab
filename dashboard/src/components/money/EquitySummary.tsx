import { Box, Link, Skeleton, Typography } from '../ui';
import { StyledCard, StyledCardContent } from '../StyledCard';
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
			<Typography
				style={{
					fontSize: '1.25rem',
					marginBottom: 'calc(var(--spacing-unit) * 1)',
				}}
				variant="h2"
			>
				{formatter.format(totalEquity)}
			</Typography>
			<Typography
				style={{
					fontSize: '1rem',
					wordBreak: 'break-word',
				}}
				variant="h3"
			>
				Home Value{' '}
				<span style={{ backgroundColor: 'var(--color-success-bg)' }}>
					{formatter.format(homeValue)}{' '}
				</span>
			</Typography>
			<Typography
				style={{
					fontSize: '1rem',
					wordBreak: 'break-word',
					paddingTop: 'calc(var(--spacing-unit) * 1)',
				}}
				variant="h3"
			>
				Mortgage{' '}
				<span style={{ backgroundColor: 'var(--color-error-bg)' }}>
					{formatter.format(mortgageBalance)}{' '}
				</span>
			</Typography>
		</div>
	);
}

function EquitySummary() {
	const { isPending, error, data } = useQueryMoneyAccounts();

	if (isPending) {
		return (
			<div>
				<Skeleton
					variant="text"
					width="100%"
					height={24}
					style={{ marginBottom: 'calc(var(--spacing-unit) * 1)' }}
				/>
				{Array(2)
					.fill(0)
					.map((_, i) => (
						<Skeleton
							key={i}
							variant="text"
							width="100%"
							height={18}
						/>
					))}
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
							Equity
						</Typography>
					</Link>
				</Box>
				<EquitySummary />
			</StyledCardContent>
		</StyledCard>
	);
}

export default EquitySummaryCard;
