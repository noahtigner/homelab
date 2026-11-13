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
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type {
	PiholeHistoryData,
	PiholeSummaryData,
} from '@/hooks/usePiholeData';

const count = new Intl.NumberFormat('en-US');
const compactCount = new Intl.NumberFormat('en-US', {
	notation: 'compact',
	maximumFractionDigits: 1,
});
const tickTime = new Intl.DateTimeFormat('en-US', {
	hour: 'numeric',
	minute: '2-digit',
});
const bucketTime = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
});

function DnsTooltip({ active, payload }: TooltipContentProps) {
	if (!active || !payload?.length) return null;
	const point = payload[0].payload as PiholeHistoryData['history'][number];
	return (
		<div
			role="tooltip"
			className="rounded border border-border bg-card px-2 py-1 text-xs text-card-foreground shadow"
		>
			<p className="mb-1 text-muted-foreground">
				{bucketTime.format(point.timestamp * 1000)}
			</p>
			<p className="flex justify-between gap-3">
				<span className="text-primary">DNS queries</span>
				<span className="tabular-nums">
					{count.format(point.total)}
				</span>
			</p>
			<p className="flex justify-between gap-3">
				<span className="text-warning-foreground">Blocked queries</span>
				<span className="tabular-nums">
					{count.format(point.blocked)}
				</span>
			</p>
		</div>
	);
}

function DnsHistory({
	history,
	isPending,
}: {
	history?: PiholeHistoryData;
	isPending: boolean;
}) {
	if (!history) {
		return isPending ? (
			<div role="status" aria-label="Loading DNS ad blocking history">
				<Skeleton className="h-[90px] w-full" />
			</div>
		) : (
			<p className="flex h-[90px] items-center text-xs text-muted-foreground">
				History unavailable
			</p>
		);
	}
	if (history.history.length === 0) {
		return (
			<p className="flex h-[90px] items-center text-xs text-muted-foreground">
				No recent query history
			</p>
		);
	}
	return (
		<div
			className="h-[90px] w-full min-w-0"
			role="img"
			aria-label="Total and blocked DNS queries over the last 24 hours"
		>
			<ResponsiveContainer width="100%" height="100%" minWidth={0}>
				<AreaChart
					data={history.history}
					margin={{ top: 5, right: 6, bottom: 0, left: 0 }}
					accessibilityLayer
				>
					<CartesianGrid vertical={false} stroke="var(--border)" />
					<XAxis
						dataKey="timestamp"
						type="number"
						domain={[history.window_start, history.window_end]}
						allowDataOverflow
						tickFormatter={(value: number) =>
							tickTime.format(value * 1000)
						}
						tickCount={4}
						minTickGap={28}
						interval="preserveStartEnd"
						tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
						height={22}
						tickLine={false}
						axisLine={false}
					/>
					<YAxis
						domain={[0, 'auto']}
						tickFormatter={(value: number) =>
							compactCount.format(value)
						}
						tickCount={3}
						allowDecimals={false}
						width={36}
						tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
						tickLine={false}
						axisLine={false}
					/>
					<Tooltip content={DnsTooltip} position={{ y: 0 }} />
					<Area
						dataKey="total"
						name="DNS queries"
						type="monotoneX"
						stroke="var(--primary)"
						fill="var(--primary)"
						fillOpacity={0.15}
						strokeWidth={2}
						isAnimationActive={false}
						dot={history.history.length === 1}
						activeDot={{ r: 3 }}
					/>
					{/* Draw blocked last so its fill and line sit above total queries. */}
					<Area
						dataKey="blocked"
						name="Blocked queries"
						type="monotoneX"
						stroke="var(--warning-foreground)"
						fill="var(--warning-foreground)"
						fillOpacity={0.15}
						strokeWidth={2}
						isAnimationActive={false}
						dot={history.history.length === 1}
						activeDot={{ r: 3 }}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}

function DnsMetric({
	label,
	color,
	value,
	detail,
	isPending,
}: {
	label: string;
	color: string;
	value?: number;
	detail?: string;
	isPending: boolean;
}) {
	return (
		<div className="flex flex-wrap items-baseline gap-x-2">
			<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
				<span
					aria-hidden="true"
					className="size-1.5 rounded-full"
					style={{ backgroundColor: color }}
				/>
				{label}
			</span>
			<div className="text-sm tabular-nums" aria-label={`${label} total`}>
				{value !== undefined ? (
					count.format(value)
				) : isPending ? (
					<Skeleton className="h-5 w-20" />
				) : (
					'—'
				)}
			</div>
			{detail && (
				<span className="text-xs text-muted-foreground">{detail}</span>
			)}
		</div>
	);
}

export default function PiholeDnsAdBlockingCard({
	summary,
	isSummaryPending,
	history,
	isHistoryPending,
}: {
	summary?: PiholeSummaryData;
	isSummaryPending: boolean;
	history?: PiholeHistoryData;
	isHistoryPending: boolean;
}) {
	return (
		<div className="col-span-12 min-w-0">
			<Card size="sm" role="region" aria-label="Pi-hole DNS ad blocking">
				<CardContent>
					<div className="mb-2 flex items-center justify-between gap-2">
						<a
							href={`http://${import.meta.env.VITE_SERVER_IP}/admin/`}
							target="_blank"
							rel="noreferrer"
							className="flex min-w-0 items-center gap-1.5 text-inherit no-underline hover:text-primary"
						>
							<img
								src="/pihole.svg"
								alt=""
								width={16}
								height={16}
								className="size-4 shrink-0 object-contain"
							/>
							<h2 className="text-base leading-tight">
								Pi-hole DNS Ad Blocking
							</h2>
						</a>
						<span className="shrink-0 text-xs text-muted-foreground">
							Last 24h
						</span>
					</div>
					<div
						className="mb-2 flex flex-wrap items-baseline gap-x-5 gap-y-1"
						aria-busy={isSummaryPending}
					>
						<DnsMetric
							label="DNS queries"
							color="var(--primary)"
							value={summary?.sum_queries}
							detail={summary && `${summary.qps.toFixed(1)}/s`}
							isPending={isSummaryPending}
						/>
						<DnsMetric
							label="Blocked"
							color="var(--warning-foreground)"
							value={summary?.sum_blocked}
							detail={
								summary &&
								`${summary.percent_blocked.toFixed(2)}%`
							}
							isPending={isSummaryPending}
						/>
						{summary ? (
							<p className="text-xs text-muted-foreground">
								{count.format(summary.gravity)} blocked domains
								· {count.format(summary.total_clients)} clients
							</p>
						) : isSummaryPending ? (
							<Skeleton className="h-4 w-48" />
						) : (
							<p
								role="alert"
								className="text-xs text-destructive-foreground"
							>
								Summary unavailable
							</p>
						)}
					</div>
					<DnsHistory
						history={history}
						isPending={isHistoryPending}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
