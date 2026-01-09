import {
	Box,
	LinearProgress,
	Skeleton,
	Typography,
	useTheme,
} from '@mui/material';
import {
	StorageOutlined as StorageIcon,
	Circle as CircleIcon,
} from '@mui/icons-material';
import { StyledCard, StyledCardContent } from '../StyledCard';
import { useNasDiagnostics } from '../../hooks/useNasDiagnostics';
import { bytesToTerabytes } from '../../services/unitConversion';

function getStatusColor(status: string): 'success' | 'warning' | 'error' {
	const normalStatuses = ['normal', 'initialized'];
	const warningStatuses = ['warning'];
	if (normalStatuses.includes(status.toLowerCase())) {
		return 'success';
	}
	if (warningStatuses.includes(status.toLowerCase())) {
		return 'warning';
	}
	return 'error';
}

function HddRow({
	diskno,
	capacity,
	status,
	temp,
	totalUsed,
	totalCapacity,
}: {
	diskno: string;
	capacity: number;
	status: string;
	temp: number;
	totalUsed: number;
	totalCapacity: number;
}) {
	const theme = useTheme();
	const statusColor = getStatusColor(status);
	// Calculate this drive's share of the used space proportionally
	const driveShareUsed = (capacity / totalCapacity) * totalUsed;
	const utilizationPercent = (driveShareUsed / capacity) * 100;

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: theme.spacing(1.5),
				py: theme.spacing(0.75),
			}}
		>
			<CircleIcon
				color={statusColor}
				sx={{ fontSize: 12, flexShrink: 0 }}
			/>
			<Typography
				sx={{
					fontSize: '0.875rem',
					minWidth: '48px',
					flexShrink: 0,
				}}
			>
				{diskno}
			</Typography>
			<Box sx={{ flexGrow: 1, minWidth: 0 }}>
				<LinearProgress
					variant="determinate"
					value={utilizationPercent}
					color={utilizationPercent > 90 ? 'error' : 'primary'}
					sx={{
						height: 8,
						borderRadius: 1,
					}}
				/>
			</Box>
			<Typography
				sx={{
					fontSize: '0.75rem',
					minWidth: '40px',
					textAlign: 'right',
					flexShrink: 0,
					color: theme.palette.text.secondary,
				}}
			>
				{utilizationPercent.toFixed(0)}%
			</Typography>
			<Typography
				sx={{
					fontSize: '0.75rem',
					minWidth: '50px',
					textAlign: 'right',
					flexShrink: 0,
					color: theme.palette.text.secondary,
				}}
			>
				{bytesToTerabytes(capacity).toFixed(1)} TB
			</Typography>
			<Typography
				sx={{
					fontSize: '0.75rem',
					minWidth: '36px',
					textAlign: 'right',
					flexShrink: 0,
					color: theme.palette.text.secondary,
				}}
			>
				{temp}°C
			</Typography>
		</Box>
	);
}

function NasStorageCardContent() {
	const theme = useTheme();
	const { isLoading, isError, data } = useNasDiagnostics();

	if (isError) {
		return (
			<Typography color="error" sx={{ py: 2 }}>
				Failed to load NAS storage data
			</Typography>
		);
	}

	if (isLoading || !data) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} variant="rectangular" height={24} />
				))}
			</Box>
		);
	}

	const hdds = data.storage.hdd_info;
	const totalUsedBytes = data.storage.vol_info.reduce(
		(acc, v) => acc + v.used_size,
		0
	);
	const totalCapacityBytes = hdds.reduce((acc, h) => acc + h.capacity, 0);
	const totalUsageTB = bytesToTerabytes(totalUsedBytes);
	const totalCapacityTB = bytesToTerabytes(totalCapacityBytes);
	const totalUsagePercent = (totalUsedBytes / totalCapacityBytes) * 100;

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: theme.spacing(1),
				}}
			>
				<Typography
					sx={{ fontSize: '1.5rem', fontWeight: 500 }}
					variant="h3"
				>
					{totalUsageTB.toFixed(2)} / {totalCapacityTB.toFixed(2)} TB
				</Typography>
				<StorageIcon color="primary" sx={{ fontSize: 32 }} />
			</Box>
			<Typography
				sx={{
					fontSize: '0.875rem',
					color: theme.palette.text.secondary,
					mb: theme.spacing(1),
				}}
			>
				{totalUsagePercent.toFixed(1)}% used across {hdds.length} drives
			</Typography>
			<Box>
				{hdds
					.sort((a, b) => a.order - b.order)
					.map((hdd) => (
						<HddRow
							key={hdd.diskno}
							diskno={hdd.diskno}
							capacity={hdd.capacity}
							status={hdd.overview_status}
							temp={hdd.temp}
							totalUsed={totalUsedBytes}
							totalCapacity={totalCapacityBytes}
						/>
					))}
			</Box>
		</>
	);
}

function NasStorageCard() {
	const theme = useTheme();

	return (
		<StyledCard variant="outlined">
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					sx={{ marginBottom: theme.spacing(1) }}
				>
					<Typography
						sx={{
							fontSize: '1.25rem',
						}}
						variant="h2"
					>
						NAS Storage
					</Typography>
				</Box>
				<NasStorageCardContent />
			</StyledCardContent>
		</StyledCard>
	);
}

export default NasStorageCard;
