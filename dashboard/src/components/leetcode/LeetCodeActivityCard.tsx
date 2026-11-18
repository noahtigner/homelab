import { isAxiosError } from 'axios';
import CalendarHeatmap from '@/components/charts/CalendarHeatmap';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeetCodeSolved } from '@/hooks/useLeetCode';
import {
	ACTIVITY_CALENDAR_DAYS,
	fillCalendarDays,
	rollingCalendarRange,
} from '@/lib/calendarHeatmap';
import {
	LeetCodeDifficultySummary,
	LeetCodeLanguageChips,
} from './LeetCodeOverview';
import {
	useLeetCodeActivity,
	useSyncLeetCodeActivity,
} from '@/hooks/useLeetCodeActivity';
import {
	activityColor,
	describeActivityDay,
	difficultyColors,
	unknownDayStyle,
} from '@/lib/leetcodeActivity';

function errorMessage(error: unknown) {
	const detail: unknown = isAxiosError<{ detail?: unknown }>(error)
		? error.response?.data?.detail
		: undefined;
	return typeof detail === 'string'
		? detail
		: 'Could not load LeetCode activity. Try again later.';
}

function DifficultyLegend() {
	return (
		<div
			className="flex flex-wrap items-center gap-x-3 gap-y-1"
			aria-label="Highest difficulty accepted per day"
		>
			{(['empty', 'easy', 'medium', 'hard', 'unknown'] as const).map(
				(level) => (
					<span
						key={level}
						className="inline-flex items-center gap-1"
					>
						<span
							aria-hidden="true"
							className="size-2.5 rounded-[2px] ring-1 ring-inset ring-foreground/5"
							style={{
								backgroundColor: difficultyColors[level],
								...(level === 'unknown' ? unknownDayStyle : {}),
							}}
						/>
						{
							{
								empty: 'No solves',
								easy: 'Easy',
								medium: 'Medium',
								hard: 'Hard',
								unknown: 'Incomplete',
							}[level]
						}
					</span>
				)
			)}
		</div>
	);
}

export default function LeetCodeActivityCard() {
	const summary = useLeetCodeSolved();
	const activity = useLeetCodeActivity();
	const sync = useSyncLeetCodeActivity();
	const calendar = activity.data;
	const range = calendar
		? rollingCalendarRange(calendar.window_end)
		: undefined;
	const days =
		calendar && range
			? fillCalendarDays(calendar.days, range, (date) => ({
					date,
					solved_count: 0,
					by_difficulty: { easy: 0, medium: 0, hard: 0 },
					hardest_difficulty: null,
					coverage: 'unknown' as const,
				}))
			: [];
	const busy =
		sync.isPending ||
		(!activity.isError &&
			(calendar?.sync_status === 'pending' ||
				calendar?.sync_status === 'syncing'));
	const observed = days.reduce((total, day) => total + day.solved_count, 0);
	const incomplete = days.some((day) => day.coverage !== 'complete');
	return (
		<Card>
			<CardContent>
				<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
					<div className="flex min-w-0 flex-wrap items-center gap-2">
						<img
							src="https://leetcode.com/favicon.ico"
							alt=""
							width={20}
							height={20}
						/>
						<a
							href={`https://leetcode.com/${import.meta.env.VITE_LEETCODE_USERNAME}/`}
							target="_blank"
							rel="noreferrer"
							className="no-underline text-inherit hover:text-primary"
						>
							<h2 className="text-lg font-medium sm:text-xl">
								LeetCode
							</h2>
						</a>
						{summary.data && (
							<p
								aria-label="All-time LeetCode problems solved"
								className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
							>
								<strong className="font-semibold text-foreground">
									{summary.data.all.solved.toLocaleString(
										'en-US'
									)}
								</strong>
								<span className="hidden sm:inline">
									{' '}
									/{' '}
									{summary.data.all.total.toLocaleString(
										'en-US'
									)}
								</span>{' '}
								solved
							</p>
						)}
					</div>
					<button
						type="button"
						disabled={busy || activity.isPending}
						onClick={() =>
							activity.isError
								? void activity.refetch()
								: sync.mutate()
						}
						className="ml-auto shrink-0 cursor-pointer rounded px-2 py-1 text-[10px] text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-default disabled:text-muted-foreground sm:text-xs"
					>
						{busy
							? 'Syncing…'
							: activity.isError
								? 'Try again'
								: 'Sync now'}
					</button>
				</div>
				<LeetCodeDifficultySummary summary={summary} />
				{activity.isPending ? (
					<div
						role="status"
						aria-label="Loading LeetCode activity"
						className="space-y-2"
					>
						<Skeleton className="h-6 w-64 max-w-full" />
						<Skeleton className="h-28 w-full" />
					</div>
				) : activity.isError ? (
					<p
						role="alert"
						className="break-words text-sm text-destructive-foreground"
					>
						{errorMessage(activity.error)}
					</p>
				) : (
					calendar &&
					range && (
						<>
							<div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
								<h3 className="text-xs font-medium text-muted-foreground">
									{observed.toLocaleString('en-US')} daily
									problem solves{' '}
									{incomplete
										? 'observed'
										: `in the last ${ACTIVITY_CALENDAR_DAYS} days`}
								</h3>
								<p className="text-[10px] text-muted-foreground">
									Highest accepted difficulty each day ·{' '}
									{calendar.timezone}
								</p>
							</div>
							{calendar.message && (
								<p
									role={
										calendar.sync_status === 'error'
											? 'alert'
											: 'status'
									}
									className={`mb-2 break-words text-xs ${calendar.sync_status === 'error' ? 'text-destructive-foreground' : 'text-muted-foreground'}`}
								>
									{calendar.message}
								</p>
							)}
							<CalendarHeatmap
								days={days}
								range={range}
								label="LeetCode activity calendar"
								getCellColor={activityColor}
								getCellStyle={(day) =>
									day.coverage !== 'complete'
										? unknownDayStyle
										: {}
								}
								getCellLabel={describeActivityDay}
								renderTooltip={describeActivityDay}
								legend={<DifficultyLegend />}
							/>
						</>
					)
				)}
				<div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t pt-2">
					<LeetCodeLanguageChips />
					{calendar?.updated_at && (
						<p className="text-[10px] text-muted-foreground">
							History as of{' '}
							{new Intl.DateTimeFormat('en-US', {
								dateStyle: 'medium',
								timeStyle: 'short',
								timeZone: calendar.timezone,
							}).format(new Date(calendar.updated_at))}
						</p>
					)}
				</div>
				{sync.isError && (
					<p
						role="alert"
						className="mt-2 text-xs text-destructive-foreground"
					>
						{errorMessage(sync.error)}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
