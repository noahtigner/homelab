import { useEffect, useState } from 'react';
import { useTheme, Typography, Link, Box, Chip } from '@mui/material';
import axios from 'axios';

import { StyledCard, StyledCardContent } from '../StyledCard';
import { CompareArrowsOutlined as CompareArrowsOutlinedIcon } from '@mui/icons-material';

interface Contributions {
	own_projects: number;
	oss_projects: number;
}

interface Repo {
	id: number;
	name: string;
	url: string;
}

interface GithubEvents {
	events: []; // TODO:
	events_seen: unknown;
	repos_seen: Repo[];
	contributions: Contributions;
}

function GithubChips({ githubEvents }: { githubEvents: GithubEvents }) {
	const { palette } = useTheme();

	const chipData = [
		{
			label: 'OSS Contributions',
			value: githubEvents.contributions.oss_projects,
		},
		{
			label: 'Own Contributions',
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
					Contributions
				</Typography>
				<CompareArrowsOutlinedIcon
					color="success"
					sx={{ fontSize: 48 }}
				/>
			</Box>
			<div>
				{githubEvents.repos_seen
					.slice(0, 4)
					.map(({ id, name, url }) => (
						<Link
							href={url}
							target="_blank"
							rel="noopener"
							key={id}
						>
							<Typography color="text.primary">{name}</Typography>
						</Link>
					))}
			</div>
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
				<Box
					display="flex"
					alignItems="center"
					sx={{ marginBottom: theme.spacing(0.5) }}
				>
					<img
						src="https://github.githubassets.com/favicons/favicon-dark.svg"
						alt="Github"
						width={20}
						style={{ marginRight: theme.spacing(1) }}
					/>
					<Link
						href={`https://github.com/${
							import.meta.env.VITE_GITHUB_USERNAME
						}`}
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
							Github
						</Typography>
					</Link>
				</Box>
				{githubEvents && <GithubSummary githubEvents={githubEvents} />}
			</StyledCardContent>
		</StyledCard>
	);
}

export default GithubSummaryCard;
