import { ReactNode } from 'react';
import { Box, Link, Skeleton, Typography, useTheme } from '@mui/material';
import {
	SwapHorizontalCircleOutlined as SwapHorizontalCircleOutlinedIcon,
	ArrowCircleDownOutlined as ArrowCircleDownOutlinedIcon,
	ArrowCircleUpOutlined as ArrowCircleUpOutlinedIcon,
} from '@mui/icons-material';
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
		<Box
			sx={{
				display: 'flex',
				flexGrow: 1,
				alignItems: 'center',
				gap: 1,
			}}
		>
			{icon}
			{text}
		</Box>
	);
}

function SpeedTestSummaryInner({ data }: { data: SpeedTestModel }) {
	return (
		<Box
			sx={{
				display: 'flex',
				gap: 0.5,
				justifyContent: 'space-between',
			}}
		>
			<div>
				<SpeedTestItem
					icon={<SwapHorizontalCircleOutlinedIcon />}
					text={data.ping.toString()}
				/>
				<SpeedTestItem
					icon={<ArrowCircleDownOutlinedIcon />}
					text={`${bytesToMegabits(data.download)} Mbps`}
				/>
				<SpeedTestItem
					icon={<ArrowCircleUpOutlinedIcon />}
					text={`${bytesToMegabits(data.upload)} Mbps`}
				/>
			</div>
			<Typography align="right">
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
					sx={{ marginBottom: 1 }}
				/>
				<Skeleton variant="text" width="100%" height={18} />
			</div>
		);
	}
	if (error) {
		return (
			<div>
				<Typography
					sx={{
						fontSize: '1.25rem',
						marginBottom: 1,
					}}
					variant="h2"
				>
					An unexpected error occurred
				</Typography>
				<Typography
					sx={{
						fontSize: '1rem',
						wordBreak: 'break-word',
					}}
					variant={'h3'}
				>
					{error.message}
				</Typography>
			</div>
		);
	}
	return <SpeedTestSummaryInner data={data} />;
}

function SpeedTestSummaryCard() {
	const theme = useTheme();
	return (
		<StyledCard variant="outlined">
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					sx={{ marginBottom: theme.spacing(0.5) }}
				>
					<img
						src="https://www.speedtest.net/favicon.ico"
						alt="SpeedTest"
						width={24}
						style={{ marginRight: theme.spacing(1) }}
					/>
					<Link
						href="https://www.speedtest.net/"
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
