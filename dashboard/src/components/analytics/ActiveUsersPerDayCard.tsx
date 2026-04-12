import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import type { z } from 'zod';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import type { activePerDaySchema } from '@/types/schemas';

type ActivePerDay = z.infer<typeof activePerDaySchema>;

function ActiveUsersChips({ activePerDay }: { activePerDay: ActivePerDay }) {
	const chipData = [
		{
			label: 'Today',
			value: activePerDay.per_day.slice(-1)[0].active_users,
		},
		{
			label: 'This Week',
			value: activePerDay.per_day
				.slice(-7)
				.reduce((acc, day) => acc + day.active_users, 0),
		},
		{
			label: 'Last 30 Days',
			value: activePerDay.per_day
				.slice(-30)
				.reduce((acc, day) => acc + day.active_users, 0),
		},
		{
			label: 'This Year',
			value: activePerDay.per_day.reduce(
				(acc, day) => acc + day.active_users,
				0
			),
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

function CustomTooltip({ active, payload }: TooltipContentProps) {
	if (active && payload && payload.length) {
		const point = payload[0].payload as { date: string };
		return (
			<div className="z-10 rounded border border-border bg-card p-1 text-card-foreground">
				<p className="text-xs font-medium">{point.date}</p>
				<p className="text-sm text-success-foreground">
					users: {payload[0].value}
				</p>
			</div>
		);
	}

	return null;
}

function AnalyticsSummary({ activePerDay }: { activePerDay: ActivePerDay }) {
	return (
		<>
			<a
				href="https://noahtigner.com"
				target="_blank"
				rel="noreferrer"
				className="no-underline text-inherit hover:text-primary"
			>
				<h2 className="text-xl">noahtigner.com</h2>
			</a>
			<div className="mt-auto">
				<ResponsiveContainer
					width="100%"
					aspect={15}
					style={{ zIndex: 50 }}
				>
					<AreaChart
						data={activePerDay.per_day}
						margin={{ top: 0, right: 0, bottom: 2, left: 0 }}
					>
						<Area
							type="monotone"
							dataKey="active_users"
							stroke="var(--color-primary)"
							fill="var(--color-primary)"
							fillOpacity={0.2}
						/>
						<Tooltip content={CustomTooltip} />
					</AreaChart>
				</ResponsiveContainer>
				<ActiveUsersChips activePerDay={activePerDay} />
			</div>
		</>
	);
}

function ActiveUsersPerDayCardContent() {
	const { isLoading, isError, data } = useActiveUsers();

	if (isError) {
		return (
			<p className="py-2 text-destructive-foreground">
				Failed to load analytics data
			</p>
		);
	}

	if (isLoading || !data) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-6 w-64" />
			</div>
		);
	}

	return <AnalyticsSummary activePerDay={data} />;
}

function ActiveUsersPerDayCard() {
	return (
		<Card>
			<CardContent className="flex grow flex-col">
				<div className="mb-1 flex items-center">
					<img
						src="https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg"
						alt="GA"
						width={20}
						className="mr-2"
					/>
					<a
						href="https://noahtigner.com"
						target="_blank"
						rel="noreferrer"
						className="no-underline text-inherit hover:text-primary"
					>
						<h2 className="text-xl">Google Analytics</h2>
					</a>
				</div>
				<ActiveUsersPerDayCardContent />
			</CardContent>
		</Card>
	);
}

export default ActiveUsersPerDayCard;
