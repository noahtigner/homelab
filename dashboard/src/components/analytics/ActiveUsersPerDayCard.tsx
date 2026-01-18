import { useEffect, useState } from 'react';
import { Box, Chip, Link, Typography } from '../ui';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import axios from 'axios';

import { StyledCard, StyledCardContent } from '../StyledCard';

interface ActiveSingleDay {
	active_users: number;
	date: string;
}

interface ActivePerDay {
	per_day: ActiveSingleDay[];
}

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
				<li key={value}>
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

function CustomTooltip({
	active,
	payload,
}: TooltipContentProps<string, string>) {
	if (active && payload && payload.length) {
		return (
			<div
				style={{
					backgroundColor: 'var(--color-paper)',
					color: 'var(--color-text-primary)',
					borderColor: 'var(--color-divider)',
					borderRadius: 'var(--border-radius-lg)',
					borderWidth: 1,
					borderStyle: 'solid',
					padding: 'calc(var(--spacing-unit) * 0.5)',
					zIndex: 1,
				}}
			>
				<Typography variant="subtitle2">
					{payload[0].payload.date}
				</Typography>
				<Typography
					variant="subtitle1"
					style={{ color: 'var(--color-success-text)' }}
				>
					users: {payload[0].value}
				</Typography>
			</div>
		);
	}

	return null;
}

function AnalyticsSummary({ activePerDay }: { activePerDay: ActivePerDay }) {
	return (
		<>
			<Link
				href="https://noahtigner.com"
				target="_blank"
				rel="noreferrer"
				style={{ textDecoration: 'none', color: 'inherit' }}
			>
				<Typography style={{ fontSize: '1.25rem' }} variant="h2">
					noahtigner.com
				</Typography>
			</Link>
			<ResponsiveContainer
				width={'100%'}
				aspect={15}
				style={{ zIndex: 50 }}
			>
				<AreaChart
					data={activePerDay.per_day}
					margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
				>
					<Area
						type="monotone"
						dataKey="active_users"
						stroke="var(--color-primary)"
						fill="var(--color-primary-dark)"
					/>
					<Tooltip content={CustomTooltip} />
				</AreaChart>
			</ResponsiveContainer>
			<ActiveUsersChips activePerDay={activePerDay} />
		</>
	);
}

function ActiveUsersPerDayCard() {
	const [activePerDay, setActivePerDay] = useState<ActivePerDay | null>(null);

	useEffect(() => {
		axios
			.get(`${import.meta.env.VITE_API_BASE}/a/active_users/`)
			.then(({ data }) => {
				setActivePerDay(data);
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
						src="https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg"
						alt="GA"
						width={20}
						style={{ marginRight: 'calc(var(--spacing-unit) * 1)' }}
					/>
					<Link
						href="https://noahtigner.com"
						target="_blank"
						rel="noreferrer"
						style={{ textDecoration: 'none', color: 'inherit' }}
					>
						<Typography
							style={{ fontSize: '1.25rem' }}
							variant="h2"
						>
							Google Analytics
						</Typography>
					</Link>
				</Box>
				{activePerDay && (
					<AnalyticsSummary activePerDay={activePerDay} />
				)}
			</StyledCardContent>
		</StyledCard>
	);
}

export default ActiveUsersPerDayCard;
