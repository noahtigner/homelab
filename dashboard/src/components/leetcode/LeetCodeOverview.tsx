import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
	useLeetCodeLanguages,
	type useLeetCodeSolved,
} from '@/hooks/useLeetCode';
import { difficultyColors } from '@/lib/leetcodeActivity';

export function LeetCodeDifficultySummary({
	summary,
}: {
	summary: ReturnType<typeof useLeetCodeSolved>;
}) {
	if (summary.isPending)
		return (
			<div
				role="status"
				aria-label="Loading LeetCode totals"
				className="mb-3 grid grid-cols-3 gap-2"
			>
				{['easy', 'medium', 'hard'].map((key) => (
					<Skeleton key={key} className="h-16 w-full" />
				))}
			</div>
		);
	if (summary.isError)
		return (
			<p
				role="alert"
				className="mb-3 text-xs text-destructive-foreground"
			>
				LeetCode totals unavailable: {summary.error.message}
			</p>
		);
	return (
		<div
			className="mb-3 grid grid-cols-3 gap-2"
			aria-label="All-time LeetCode difficulty totals"
		>
			{(['easy', 'medium', 'hard'] as const).map((key) => {
				const stat = summary.data[key];
				const label = key[0].toUpperCase() + key.slice(1);
				return (
					<div
						key={key}
						className="min-w-0 rounded-lg bg-muted/50 px-2.5 py-2 sm:px-3"
					>
						<div className="flex flex-col items-start gap-y-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-x-2">
							<h3
								className="text-xs font-medium"
								style={{ color: difficultyColors[key] }}
							>
								{label}
							</h3>
							<p className="font-semibold tabular-nums">
								<span className="text-lg">
									{stat.solved.toLocaleString('en-US')}
								</span>
								<span className="hidden text-xs font-normal text-muted-foreground sm:inline">
									{' '}
									/ {stat.total.toLocaleString('en-US')}
								</span>
							</p>
						</div>
						<Progress
							value={stat.solved_percent}
							aria-label={`${label} problems solved`}
							aria-valuetext={`${stat.solved} of ${stat.total} problems solved`}
							className="mt-1.5 [&_[data-slot=progress-indicator]]:bg-current"
							style={{ color: difficultyColors[key] }}
						/>
					</div>
				);
			})}
		</div>
	);
}

export function LeetCodeLanguageChips() {
	const languages = useLeetCodeLanguages();
	if (languages.isPending)
		return (
			<Skeleton
				className="h-4 w-32"
				aria-label="Loading LeetCode languages"
			/>
		);
	if (languages.isError)
		return (
			<p className="text-[10px] text-muted-foreground">
				Languages unavailable
			</p>
		);
	return (
		<ul
			aria-label="Languages used on LeetCode"
			className="flex list-none flex-wrap items-center gap-1.5 p-0 text-[10px] text-muted-foreground"
		>
			{languages.data.map(({ languageName, problemsSolved }) => (
				<li
					key={languageName}
					className="rounded bg-muted px-1.5 py-0.5"
				>
					{languageName}{' '}
					<span className="font-medium text-foreground/75">
						{problemsSolved}
					</span>
				</li>
			))}
		</ul>
	);
}
