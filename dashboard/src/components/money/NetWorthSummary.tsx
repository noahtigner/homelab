import { Box, Divider, Grid, Link, Skeleton, Typography } from '../ui';
import { StyledCard, StyledCardContent } from '../StyledCard';
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
			<Typography
				style={{
					fontSize: '1.25rem',
					marginBottom: 'calc(var(--spacing-unit) * 1)',
				}}
				variant="h2"
			>
				{formatter.format(totalNetWorth)}
			</Typography>
			<Grid container spacing={1}>
				{['asset', 'liability'].map((group) => (
					<Grid key={group} xs={12} sm={6}>
						<Typography
							style={{
								fontSize: '0.75rem',
								display: 'flex',
								justifyContent: 'space-between',
							}}
							variant="h4"
						>
							{group === 'asset' ? 'Assets' : 'Liabilities'}{' '}
							<span
								style={{
									backgroundColor:
										group === 'asset'
											? 'var(--color-success-bg)'
											: 'var(--color-error-bg)',
								}}
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
						</Typography>
						<Divider
							style={{
								marginTop: 'calc(var(--spacing-unit) * 0.25)',
								marginBottom: 0,
							}}
						/>
						{data.data.accountTypeSummaries
							.filter(
								(accountTypeSummary) =>
									accountTypeSummary.type.group === group
							)
							.map((accountTypeSummary) => (
								<Typography
									key={accountTypeSummary.type.name}
									style={{
										fontSize: '0.75rem',
										display: 'flex',
										justifyContent: 'space-between',
									}}
									variant="body1"
								>
									{accountTypeSummary.type.display}{' '}
									<span
										style={{
											backgroundColor: isAsset(
												accountTypeSummary
											)
												? 'var(--color-success-bg)'
												: 'var(--color-error-bg)',
										}}
									>
										{formatter.format(
											accountTypeSummary.totalDisplayBalance
										)}
									</span>
								</Typography>
							))}
					</Grid>
				))}
			</Grid>
		</div>
	);
}

function NetWorthSummary() {
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
				{Array(4)
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
	return <NetWorthSummaryInner data={data} />;
}

function NetWorthSummaryCard() {
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
							Net Worth
						</Typography>
					</Link>
				</Box>
				<NetWorthSummary />
			</StyledCardContent>
		</StyledCard>
	);
}

export default NetWorthSummaryCard;
