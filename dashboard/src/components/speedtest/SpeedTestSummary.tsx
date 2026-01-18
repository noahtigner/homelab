import { ReactNode } from 'react';
import { Box, Link, Skeleton, Typography } from '../ui';
import { StyledCard, StyledCardContent } from '../StyledCard';
import { useSpeedTest } from '../../hooks/useSpeedTest';
import type { z } from 'zod';
import type { speedTestSchema } from '../../types/schemas';

type SpeedTestModel = z.infer<typeof speedTestSchema>;

const bytesToMegabits = (bytes: number): number => {
	const megabits = bytes / 1e6;
	return Math.round(megabits * 100) / 100;
};

const getTestElapsedTime = (timestamp: string): number => {
	const testDate = new Date(timestamp).getTime();
	const currentDate = new Date().getTime();

	console.log(testDate, currentDate);

	const diffInMilliseconds = currentDate - testDate;
	const diffInMinutes = Math.floor(diffInMilliseconds / 1000 / 60);
	return diffInMinutes;
};

function SpeedTestItem({ icon, text }: { icon: ReactNode; text: string }) {
	return (
		<Box display="flex" flexGrow={1} alignItems="center" gap={1}>
			{icon}
			{text}
		</Box>
	);
}

function SpeedTestSummaryInner({ data }: { data: SpeedTestModel }) {
	return (
		<Box display="flex" justifyContent="space-between" gap={0.5}>
			<div>
				<SpeedTestItem
					icon={<span>↔</span>}
					text={data.ping.toString()}
				/>
				<SpeedTestItem
					icon={<span>↓</span>}
					text={`${bytesToMegabits(data.download)} Mbps`}
				/>
				<SpeedTestItem
					icon={<span>↑</span>}
					text={`${bytesToMegabits(data.upload)} Mbps`}
				/>
			</div>
			<Typography style={{ textAlign: 'right' }}>
				last tested {getTestElapsedTime(data.timestamp)} minutes ago
				<br />
				{data.client.ip}
				<br />
				{data.client.isp}, {data.client.country}
			</Typography>
		</Box>
	);
}

function SpeedTestSummary() {
	const { isPending, error, data } = useSpeedTest();

	if (isPending) {
		return (
			<div>
				<Skeleton
					variant="text"
					width="100%"
					height={24}
					style={{ marginBottom: 'calc(var(--spacing-unit) * 1)' }}
				/>
				<Skeleton variant="text" width="100%" height={18} />
			</div>
		);
	}
	if (error) {
		return (
			<div>
				<Typography
					style={{
						fontSize: '1.25rem',
						marginBottom: 'calc(var(--spacing-unit) * 1)',
					}}
					variant="h2"
				>
					An unexpected error occurred
				</Typography>
				<Typography
					style={{
						fontSize: '1rem',
						wordBreak: 'break-word',
					}}
					variant="h3"
				>
					{error.message}
				</Typography>
			</div>
		);
	}
	return <SpeedTestSummaryInner data={data} />;
}

function SpeedTestSummaryCard() {
	return (
		<StyledCard>
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					style={{ marginBottom: 'calc(var(--spacing-unit) * 0.5)' }}
				>
					<img
						src="https://www.speedtest.net/favicon.ico"
						alt="SpeedTest"
						width={24}
						style={{ marginRight: 'calc(var(--spacing-unit) * 1)' }}
					/>
					<Link
						href="https://www.speedtest.net/"
						target="_blank"
						rel="noreferrer"
						style={{ textDecoration: 'none', color: 'inherit' }}
					>
						<Typography
							style={{ fontSize: '1.25rem' }}
							variant="h2"
						>
							SpeedTest
						</Typography>
					</Link>
				</Box>
				<SpeedTestSummary />
			</StyledCardContent>
		</StyledCard>
	);
}

export default SpeedTestSummaryCard;
