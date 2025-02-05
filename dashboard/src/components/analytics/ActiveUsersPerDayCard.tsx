import { useEffect, useState } from 'react';
import { useTheme, Typography, Link, Box, Chip } from '@mui/material';
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	Tooltip,
	TooltipProps,
} from 'recharts';
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
	const { palette } = useTheme();

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
				<li key={value}>
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

function CustomTooltip({ active, payload }: TooltipProps<string, string>) {
	const theme = useTheme();
	if (active && payload && payload.length) {
		return (
			<div
				style={{
					backgroundColor: theme.palette.background.paper,
					color: theme.palette.text.primary,
					borderColor: theme.palette.divider,
					borderRadius: theme.shape.borderRadius,
					borderWidth: 1,
					borderStyle: 'solid',
					padding: theme.spacing(0.5),
					zIndex: 1,
				}}
			>
				<Typography variant="subtitle2">
					{payload[0].payload.date}
				</Typography>
				<Typography
					variant="subtitle1"
					style={{ color: theme.palette.success.main }}
				>
					users: {payload[0].value}
				</Typography>
			</div>
		);
	}

	return null;
}

function AnalyticsSummary({ activePerDay }: { activePerDay: ActivePerDay }) {
	const theme = useTheme();

	return (
		<>
			{/* <Box
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
					}}
					variant="h3"
				>
					{activePerDay.per_day.slice(-7).reduce((acc, day) => {
						return acc + day.active_users;
					}, 0)}{' '}
					/ week
				</Typography>
				<PersonIcon color="success" sx={{ fontSize: 48 }} />
			</Box> */}
			<Link
				href="https://noahtigner.com"
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
					noahtigner.com
				</Typography>
			</Link>
			<ResponsiveContainer
				width={'100%'}
				height="min-height"
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
						stroke={theme.palette.primary.main}
						fill={theme.palette.primary.dark}
					/>
					<Tooltip content={<CustomTooltip />} />
				</AreaChart>
			</ResponsiveContainer>
			<ActiveUsersChips activePerDay={activePerDay} />
		</>
	);
}

function ActiveUsersPerDayCard() {
	const theme = useTheme();

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
		<StyledCard variant="outlined">
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					sx={{ marginBottom: theme.spacing(0.5) }}
				>
					<img
						src="https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg"
						alt="GA"
						width={20}
						style={{ marginRight: theme.spacing(1) }}
					/>
					<Link
						href="https://noahtigner.com"
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
