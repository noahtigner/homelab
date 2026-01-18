import { useEffect, useState } from 'react';
import { Box, Chip, Link, Typography } from '../ui';
import { CompareArrowsIcon } from '../icons';
import axios from 'axios';

import { StyledCard, StyledCardContent } from '../StyledCard';

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
			component="ul"
			display="flex"
			flexWrap="wrap"
			justifyContent="flex-start"
			alignItems="flex-start"
			gap={1}
			style={{
				listStyle: 'none',
				margin: 0,
				marginTop: 'calc(var(--spacing-unit) * 1)',
				padding: 0,
			}}
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
										color: 'var(--color-text-secondary)',
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
	return (
		<>
			<Box
				display="flex"
				flexGrow={1}
				justifyContent="space-between"
				style={{ marginBottom: 'calc(var(--spacing-unit) * 2)' }}
			>
				<Typography
					style={{
						fontSize: '2.5rem',
						marginBottom: 'calc(var(--spacing-unit) * 0.5)',
					}}
					variant="h3"
				>
					Contributions
				</Typography>
				<CompareArrowsIcon color="success" fontSize={48} />
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
							<Typography>{name}</Typography>
						</Link>
					))}
			</div>
			<GithubChips githubEvents={githubEvents} />
		</>
	);
}

function GithubSummaryCard() {
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
		<StyledCard>
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					style={{ marginBottom: 'calc(var(--spacing-unit) * 0.5)' }}
				>
					<img
						src="https://github.githubassets.com/favicons/favicon-dark.svg"
						alt="Github"
						width={20}
						style={{ marginRight: 'calc(var(--spacing-unit) * 1)' }}
					/>
					<Link
						href={`https://github.com/${
							import.meta.env.VITE_GITHUB_USERNAME
						}`}
						target="_blank"
						rel="noreferrer"
						style={{ textDecoration: 'none', color: 'inherit' }}
					>
						<Typography
							style={{ fontSize: '1.25rem' }}
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
