import { useEffect, useState } from 'react';
import {
	useTheme,
	Typography,
	Link,
	IconButton,
	Box,
	Chip,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import axios from 'axios';

import { StyledCard, StyledCardContent } from '../StyledCard';

interface Contributions {
	own_projects: number;
	oss_projects: number;
}

interface GithubEvents {
	events: []; // TODO:
	events_seen: unknown;
	repos_seen: []; // TODO
	contributions: Contributions;
}

function GithubChips({ githubEvents }: { githubEvents: GithubEvents }) {
	const { palette } = useTheme();

	const chipData = [
		{
			label: 'OSS Project Contributions',
			value: githubEvents.contributions.oss_projects,
		},
		{
			label: 'Own Project Contributions',
			value: githubEvents.contributions.own_projects,
		},
	];

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

function GithubSummary({ githubEvents }: { githubEvents: GithubEvents }) {
	// const theme = useTheme();

	return (
		<>
			{/* <Box
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
					{npmPackageInfo.downloads.total} / month
				</Typography>
				<DownloadOutlinedIcon color="success" sx={{ fontSize: 48 }} />
			</Box>
			<ResponsiveContainer width={'100%'} aspect={10}>
				<AreaChart
					data={npmPackageInfo.downloads.per_day}
					margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
				>
					<Area
						type="monotone"
						dataKey="downloads"
						stroke={theme.palette.success.main}
						fill={theme.palette.success.dark}
					/>
					<Tooltip content={<CustomTooltip />} />
				</AreaChart>
			</ResponsiveContainer> */}
			<GithubChips githubEvents={githubEvents} />
		</>
	);
}

function GithubSummaryCard() {
	const theme = useTheme();

	const [githubEvents, setGithubEvents] = useState<GithubEvents | null>(null);

	useEffect(() => {
		axios
			.get(`${import.meta.env.VITE_API_BASE}/github/events/`)
			.then(({ data }) => {
				setGithubEvents(data);
			})
			.catch((error) => console.error(error));
	}, []);

	return (
		<StyledCard variant="outlined">
			<StyledCardContent>
				<Box display="flex" alignItems="start">
					<Typography
						sx={{
							fontSize: '1.25rem',
							marginBottom: theme.spacing(0.5),
						}}
						variant="h2"
					>
						Github
					</Typography>
					<IconButton
						component={Link}
						href={`https://github.com/${
							import.meta.env.VITE_GITHUB_USERNAME
						}`}
						target="_blank"
						rel="noopener"
						sx={{ padding: 0, marginLeft: theme.spacing(0.5) }}
					>
						<LinkIcon />
					</IconButton>
				</Box>
				{githubEvents && <GithubSummary githubEvents={githubEvents} />}
			</StyledCardContent>
		</StyledCard>
	);
}

export default GithubSummaryCard;
