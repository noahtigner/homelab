import { useCallback, useId, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	type TooltipContentProps,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import {
	useNetWorthHistory,
	type NetWorthSnapshot,
} from '@/hooks/useNetWorthHistory';
import {
	getNetWorthChange,
	getNetWorthPointBudget,
	netWorthPeriods,
	parseHistoryDate,
	sampleNetWorthHistory,
	type NetWorthPeriod,
} from '@/lib/netWorthHistory';

const currency = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});
const signedCurrency = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	signDisplay: 'exceptZero',
});
const compactCurrency = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	notation: 'compact',
	maximumFractionDigits: 1,
});
const percentage = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 2,
	signDisplay: 'exceptZero',
});
const fullDate = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
});

function HistoryTooltip({ active, payload }: TooltipContentProps) {
	if (!active || !payload?.length) return null;
	const point = payload[0].payload as NetWorthSnapshot;
	return (
		<div className="rounded border border-border bg-card p-3 text-xs text-card-foreground shadow">
			<p className="mb-1">
				{fullDate.format(parseHistoryDate(point.date))}
			</p>
			<p>Net worth: {currency.format(point.balance)}</p>
			<p className="text-success-foreground">
				Assets: {currency.format(point.assetsBalance)}
			</p>
			<p className="text-destructive-foreground">
				Liabilities: {currency.format(point.liabilitiesBalance)}
			</p>
		</div>
	);
}

function HistoryChart({ snapshots }: { snapshots: NetWorthSnapshot[] }) {
	const [pointBudget, setPointBudget] = useState(240);
	const handleResize = useCallback((width: number) => {
		// Account for the Y axis and right chart margin.
		setPointBudget(getNetWorthPointBudget(width - 73));
	}, []);
	const first = snapshots[0];
	const last = snapshots[snapshots.length - 1];
	const showYear =
		parseHistoryDate(first.date).getFullYear() !==
		parseHistoryDate(last.date).getFullYear();
	const tickDate = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		...(showYear ? { year: '2-digit' } : { day: 'numeric' }),
	});
	const { chartData, resolutionLabel } = useMemo(() => {
		const sampled = sampleNetWorthHistory(snapshots, pointBudget);
		return {
			chartData: sampled.snapshots.map((snapshot) => ({
				...snapshot,
				timestamp: parseHistoryDate(snapshot.date).getTime(),
			})),
			resolutionLabel: sampled.resolutionLabel,
		};
	}, [snapshots, pointBudget]);
	return (
		<>
			<p className="mb-2 text-xs text-muted-foreground">
				{fullDate.format(parseHistoryDate(first.date))} –{' '}
				{fullDate.format(parseHistoryDate(last.date))}
				{' · '}
				<span aria-label="Chart resolution">{resolutionLabel}</span>
			</p>
			<div
				className="h-[200px] w-full min-w-0"
				aria-label="Net worth history chart"
			>
				<ResponsiveContainer
					width="100%"
					height="100%"
					minWidth={0}
					onResize={handleResize}
				>
					<AreaChart
						data={chartData}
						margin={{ top: 10, right: 8, bottom: 0, left: 0 }}
						accessibilityLayer
					>
						<CartesianGrid
							vertical={false}
							stroke="var(--border)"
						/>
						<XAxis
							dataKey="timestamp"
							type="number"
							scale="time"
							domain={['dataMin', 'dataMax']}
							tickFormatter={(value: number) =>
								tickDate.format(new Date(value))
							}
							minTickGap={45}
							tick={{
								fill: 'var(--muted-foreground)',
								fontSize: 11,
							}}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							tickFormatter={(value: number) =>
								compactCurrency.format(value)
							}
							domain={['auto', 'auto']}
							width={65}
							tick={{
								fill: 'var(--muted-foreground)',
								fontSize: 11,
							}}
							tickLine={false}
							axisLine={false}
						/>
						<Tooltip content={HistoryTooltip} />
						<Area
							type="monotoneX"
							dataKey="balance"
							name="Net worth"
							stroke="var(--primary)"
							fill="var(--primary)"
							fillOpacity={0.15}
							strokeWidth={2}
							isAnimationActive={false}
							dot={snapshots.length === 1}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</>
	);
}

export default function NetWorthHistory({
	currentNetWorth,
}: {
	currentNetWorth?: number;
}) {
	const [period, setPeriod] = useState<NetWorthPeriod>('6m');
	const selectId = useId();
	const history = useNetWorthHistory(period);
	const snapshots = history.data?.snapshots;
	const first = snapshots?.[0];
	const last = snapshots?.[snapshots.length - 1];
	const change =
		!history.isError && first && last
			? getNetWorthChange(first.balance, last.balance)
			: undefined;
	const detail: unknown = isAxiosError<{ detail?: unknown }>(history.error)
		? history.error.response?.data?.detail
		: undefined;
	const errorMessage =
		typeof detail === 'string' && detail.trim()
			? detail
			: history.error?.message;

	return (
		<section
			className="mt-5 min-w-0 border-t pt-4"
			aria-label="Net worth history"
		>
			<div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
				<div
					className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
					aria-live="polite"
				>
					<span
						className="text-xl font-bold"
						aria-label="Current net worth"
					>
						{currentNetWorth === undefined
							? '—'
							: currency.format(currentNetWorth)}
					</span>
					{change ? (
						<span
							className={`text-sm ${
								change.dollars > 0
									? 'text-success-foreground'
									: change.dollars < 0
										? 'text-destructive-foreground'
										: 'text-muted-foreground'
							}`}
						>
							{signedCurrency.format(change.dollars)}
							{change.percent !== null &&
								` (${percentage.format(change.percent)})`}{' '}
							<span className="text-muted-foreground">
								{snapshots?.length === 1
									? 'Only one snapshot available'
									: 'over selected period'}
							</span>
						</span>
					) : history.isPending ? (
						<Skeleton className="h-4 w-48" />
					) : null}
				</div>
				<div className="flex items-center gap-2">
					<label
						htmlFor={selectId}
						className="text-xs text-muted-foreground"
					>
						Time range
					</label>
					<select
						id={selectId}
						value={period}
						onChange={(event) =>
							setPeriod(event.target.value as NetWorthPeriod)
						}
						className="rounded border border-input bg-card px-2 py-1 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
					>
						{netWorthPeriods.map(({ value, label }) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</select>
				</div>
			</div>
			{history.isPending ? (
				<div
					className="space-y-2"
					role="status"
					aria-label="Loading net worth history"
				>
					<Skeleton className="h-4 w-64" />
					<Skeleton className="h-[200px] w-full" />
				</div>
			) : history.isError ? (
				<div role="alert" className="py-4 text-sm">
					<p className="text-destructive-foreground">
						Net worth history unavailable
					</p>
					<p className="mt-1 break-words text-muted-foreground">
						{errorMessage}
					</p>
					<button
						type="button"
						onClick={() => void history.refetch()}
						className="mt-2 text-primary underline"
					>
						Try again
					</button>
				</div>
			) : history.data.snapshots.length === 0 ? (
				<p className="py-8 text-sm text-muted-foreground">
					No net-worth history available for this period.
				</p>
			) : (
				<HistoryChart snapshots={history.data.snapshots} />
			)}
		</section>
	);
}
