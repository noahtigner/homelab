import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
	Box,
	Divider,
	Link,
	Skeleton,
	Typography,
	useTheme,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { StyledCard, StyledCardContent } from '../StyledCard';

interface Account {
	id: string;
	syncDisabled: boolean;
	isHidden: boolean;
	isAsset: boolean;
	includeInNetWorth: boolean;
	type: {
		name: string;
		display: string;
	};
	displayName: string;
	displayBalance: number;
	signedBalance: number;
	updatedAt: string;
	icon: string;
	logoUrl: string;
	includeBalanceInNetWorth: boolean;
	institution?: {
		id: string;
		name: string;
	};
}

interface AccountTypeSummary {
	type: {
		display: string;
		group: 'asset' | 'liability';
		name: string;
	};
	accounts: Account[];
	totalDisplayBalance: number;
}

interface NetWorthSummaryData {
	data: {
		accountTypeSummaries: AccountTypeSummary[];
	};
}

const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});

const isAsset = (accountType: AccountTypeSummary): boolean => {
	return accountType.type.group === 'asset';
};

function NetWorthSummaryInner({ data }: { data: NetWorthSummaryData }) {
	const theme = useTheme();

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
				sx={{
					fontSize: '1.25rem',
					marginBottom: theme.spacing(1),
				}}
				variant="h2"
			>
				{formatter.format(totalNetWorth)}
			</Typography>
			<Grid container>
				{['asset', 'liability'].map((group) => (
					<Grid key={group} xs={12} sm={6}>
						<Typography
							sx={{
								fontSize: '0.75rem',
							}}
							variant="h4"
						>
							{group === 'asset' ? 'Assets' : 'Liabilities'}{' '}
							<span
								style={{
									color:
										group === 'asset'
											? theme.palette.success.main
											: theme.palette.error.main,
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
						<Divider role="presentation" sx={{ mt: 0.25 }} />
						{data.data.accountTypeSummaries
							.filter(
								(accountTypeSummary) =>
									accountTypeSummary.type.group === group
							)
							.map((accountTypeSummary) => (
								<Typography
									key={accountTypeSummary.type.name}
									sx={{
										fontSize: '0.75rem',
									}}
									variant="body1"
								>
									{accountTypeSummary.type.display}{' '}
									<span
										style={{
											color: isAsset(accountTypeSummary)
												? theme.palette.success.main
												: theme.palette.error.main,
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
	const { isPending, error, data } = useQuery({
		queryKey: ['NetWorthSummary'],
		refetchInterval: 1000 * 60 * 15, // 15 minutes
		queryFn: () =>
			axios
				.get<NetWorthSummaryData>(`/money/accounts/`)
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
				{...Array(4)
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
	return <NetWorthSummaryInner data={data} />;
}

function NetWorthSummaryCard() {
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
