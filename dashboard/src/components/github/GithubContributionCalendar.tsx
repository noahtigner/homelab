import { isAxiosError } from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { useGithubContributions } from '@/hooks/useGithubContributions';
import ContributionCalendar from './ContributionCalendar';

export default function GithubContributionCalendar() {
	const calendar = useGithubContributions();
	if (calendar.isPending) {
		return (
			<div
				role="status"
				aria-label="Loading GitHub contribution calendar"
				className="mt-2 space-y-2"
			>
				<Skeleton className="h-6 w-64 max-w-full" />
				<Skeleton className="h-28 w-full" />
			</div>
		);
	}
	if (calendar.isError) {
		const detail: unknown = isAxiosError<{ detail?: unknown }>(
			calendar.error
		)
			? calendar.error.response?.data?.detail
			: undefined;
		return (
			<div role="alert" className="mt-2 text-sm">
				<p className="text-destructive-foreground">
					GitHub contribution calendar unavailable
				</p>
				<p className="mt-1 break-words text-xs text-muted-foreground">
					{typeof detail === 'string'
						? detail
						: 'Could not load contribution history. Try again later.'}
				</p>
				<button
					type="button"
					onClick={() => void calendar.refetch()}
					className="mt-1 cursor-pointer text-xs text-primary underline focus-visible:outline-2 focus-visible:outline-ring"
				>
					Try again
				</button>
			</div>
		);
	}
	return <ContributionCalendar calendar={calendar.data} />;
}
