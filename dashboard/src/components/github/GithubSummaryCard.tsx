import { GitCompareArrows } from 'lucide-react';
import type { z } from 'zod';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGithubEvents } from '@/hooks/useGithubEvents';
import type { githubEventsSchema } from '@/types/schemas';

type GithubEvents = z.infer<typeof githubEventsSchema>;

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
		<ul className="mt-2 flex list-none flex-wrap items-start justify-start gap-2 p-0">
			{chipData.map(({ label, value }) => (
				<li key={label}>
					<Badge variant="secondary">
						{label}{' '}
						<strong className="text-muted-foreground">
							({value})
						</strong>
					</Badge>
				</li>
			))}
		</ul>
	);
}

function GithubSummary({ githubEvents }: { githubEvents: GithubEvents }) {
	return (
		<>
			<div className="mb-2 flex grow justify-between">
				<h3 className="text-2xl">Contributions</h3>
				<GitCompareArrows className="size-8 text-success-foreground" />
			</div>
			<div>
				{githubEvents.repos_seen
					.slice(0, 4)
					.map(({ id, name, url }) => (
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							key={id}
							className="block text-foreground transition-colors duration-150 hover:text-primary"
						>
							{name}
						</a>
					))}
			</div>
			<div className="mt-auto">
				<GithubChips githubEvents={githubEvents} />
			</div>
		</>
	);
}

function GithubSummaryCardContent() {
	const { isLoading, isError, data } = useGithubEvents();

	if (isError) {
		return (
			<p className="py-2 text-destructive-foreground">
				Failed to load GitHub data
			</p>
		);
	}

	if (isLoading || !data) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-10 w-48" />
				<Skeleton className="h-6 w-64" />
				<Skeleton className="h-6 w-56" />
				<Skeleton className="h-6 w-48" />
			</div>
		);
	}

	return <GithubSummary githubEvents={data} />;
}

function GithubSummaryCard() {
	return (
		<Card>
			<CardContent className="flex grow flex-col">
				<div className="mb-1 flex items-center">
					<img
						src="https://github.githubassets.com/favicons/favicon-dark.svg"
						alt="Github"
						width={20}
						className="mr-2"
					/>
					<a
						href={`https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}`}
						target="_blank"
						rel="noreferrer"
						className="no-underline text-inherit hover:text-primary"
					>
						<h2 className="text-xl">Github</h2>
					</a>
				</div>
				<GithubSummaryCardContent />
			</CardContent>
		</Card>
	);
}

export default GithubSummaryCard;
