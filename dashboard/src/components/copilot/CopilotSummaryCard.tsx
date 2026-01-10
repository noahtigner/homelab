import { useTheme, Typography, Link, Box, Chip, Skeleton } from '@mui/material';
import { SmartToyOutlined as CopilotIcon } from '@mui/icons-material';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { StyledCard, StyledCardContent } from '../StyledCard';

interface CopilotEditor {
	name: string;
	total_engaged_users: number;
}

interface CopilotLanguage {
	name: string;
	total_engaged_users: number;
}

interface CopilotModel {
	name: string;
	is_custom_model: boolean;
	total_engaged_users: number;
}

interface CopilotMetrics {
	total_active_users: number;
	total_engaged_users: number;
	languages: CopilotLanguage[];
	editors: CopilotEditor[];
	models: CopilotModel[];
}

interface CopilotSummary {
	total_seats: number;
	seats_assigned: number;
	seats_active_this_cycle: number;
	seats_inactive_this_cycle: number;
	seat_breakdown_by_status: Record<string, number>;
}

interface CopilotData {
	summary: CopilotSummary | null;
	metrics: CopilotMetrics | null;
}

function CopilotChips({ copilotData }: { copilotData: CopilotData }) {
	const { palette } = useTheme();

	const chipData: { label: string; value: string | number }[] = [];

	if (copilotData.metrics) {
		chipData.push({
			label: 'Active Users',
			value: copilotData.metrics.total_active_users,
		});
		chipData.push({
			label: 'Engaged Users',
			value: copilotData.metrics.total_engaged_users,
		});
	}

	if (copilotData.summary) {
		chipData.push({
			label: 'Total Seats',
			value: copilotData.summary.total_seats,
		});
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'start',
				alignContent: 'start',
				listStyle: 'none',
				m: 0,
				marginTop: 1,
				p: 0,
				gap: 1,
			}}
			component="ul"
		>
			{chipData.map(({ label, value }) => (
				<li key={label}>
					<Chip
						size="small"
						label={
							<>
								{label}{' '}
								<strong
									style={{
										color: palette.text.secondary,
									}}
								>
									({value})
								</strong>
							</>
						}
					/>
				</li>
			))}
		</Box>
	);
}

function CopilotSummaryContent({ copilotData }: { copilotData: CopilotData }) {
	const theme = useTheme();

	const topLanguages = copilotData.metrics?.languages.slice(0, 4) ?? [];
	const topModels = copilotData.metrics?.models.slice(0, 3) ?? [];

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					flexGrow: 1,
					justifyContent: 'space-between',
					marginBottom: theme.spacing(2),
				}}
			>
				<Typography
					sx={{
						fontSize: '2.5rem',
						marginBottom: theme.spacing(0.5),
					}}
					variant="h3"
				>
					Usage Metrics
				</Typography>
				<CopilotIcon color="success" sx={{ fontSize: 48 }} />
			</Box>
			{topLanguages.length > 0 && (
				<div>
					<Typography
						variant="subtitle2"
						color="text.secondary"
						sx={{ marginBottom: 0.5 }}
					>
						Top Languages
					</Typography>
					{topLanguages.map(({ name, total_engaged_users }) => (
						<Typography key={name} color="text.primary">
							{name} ({total_engaged_users} users)
						</Typography>
					))}
				</div>
			)}
			{topModels.length > 0 && (
				<Box sx={{ marginTop: 1 }}>
					<Typography
						variant="subtitle2"
						color="text.secondary"
						sx={{ marginBottom: 0.5 }}
					>
						Models Used
					</Typography>
					{topModels.map(
						({ name, is_custom_model, total_engaged_users }) => (
							<Typography key={name} color="text.primary">
								{name}
								{is_custom_model ? ' (Custom)' : ''} (
								{total_engaged_users} users)
							</Typography>
						)
					)}
				</Box>
			)}
			<CopilotChips copilotData={copilotData} />
		</>
	);
}

function CopilotSummarySkeleton() {
	const theme = useTheme();

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					flexGrow: 1,
					justifyContent: 'space-between',
					marginBottom: theme.spacing(2),
				}}
			>
				<Typography
					sx={{
						fontSize: '2.5rem',
						marginBottom: theme.spacing(0.5),
					}}
					variant="h3"
				>
					Loading...
				</Typography>
				<CopilotIcon color="success" sx={{ fontSize: 48 }} />
			</Box>
			<div>
				<Skeleton variant="text" width="60%" height={24} />
				<Skeleton variant="text" width="50%" height={20} />
				<Skeleton variant="text" width="45%" height={20} />
				<Skeleton variant="text" width="55%" height={20} />
			</div>
		</>
	);
}

function CopilotSummaryCard() {
	const theme = useTheme();

	const { isPending, error, data } = useQuery({
		queryKey: ['copilotData'],
		queryFn: () =>
			axios.get<CopilotData>(`/copilot/`).then((res) => res.data),
	});

	const hasData = data && (data.summary || data.metrics);

	return (
		<StyledCard variant="outlined">
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					sx={{ marginBottom: theme.spacing(0.5) }}
				>
					<img
						src="https://github.githubassets.com/favicons/favicon-dark.svg"
						alt="GitHub Copilot"
						width={20}
						style={{ marginRight: theme.spacing(1) }}
					/>
					<Link
						href="https://github.com/features/copilot"
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
							GitHub Copilot
						</Typography>
					</Link>
				</Box>
				{error && (
					<Typography color="error">
						Error loading Copilot data
					</Typography>
				)}
				{isPending && <CopilotSummarySkeleton />}
				{!isPending && hasData && (
					<CopilotSummaryContent copilotData={data} />
				)}
				{!isPending && !hasData && !error && (
					<Typography color="text.secondary">
						No Copilot data available
					</Typography>
				)}
			</StyledCardContent>
		</StyledCard>
	);
}

export default CopilotSummaryCard;
