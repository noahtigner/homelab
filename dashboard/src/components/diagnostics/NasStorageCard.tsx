import { Box, LinearProgress, Skeleton, Typography } from '../ui';
import { StorageIcon, CircleIcon } from '../icons';
import { StyledCard, StyledCardContent } from '../StyledCard';
import { useNasDiagnostics } from '../../hooks/useNasDiagnostics';
import {
	bytesToTerabytes,
	celsiusToFahrenheit,
} from '../../services/unitConversion';

function getStatusColor(
	status: string
): 'success' | 'warning' | 'error' | 'primary' {
	const normalStatuses = ['normal', 'initialized'];
	const warningStatuses = ['warning'];
	const errorStatuses = ['crashed', 'error', 'failing', 'failed'];
	const lowerStatus = status.toLowerCase();
	if (normalStatuses.includes(lowerStatus)) {
		return 'success';
	}
	if (warningStatuses.includes(lowerStatus)) {
		return 'warning';
	}
	if (errorStatuses.includes(lowerStatus)) {
		return 'error';
	}
	// Unknown status - show as primary rather than error to avoid false alarms
	return 'primary';
}

function HddRow({
	diskno,
	capacity,
	status,
	temp,
}: {
	diskno: string;
	capacity: number;
	status: string;
	temp: number;
}) {
	const statusColor = getStatusColor(status);

	return (
		<Box
			display="flex"
			alignItems="center"
			gap={1.5}
			style={{
				paddingTop: 'calc(var(--spacing-unit) * 0.75)',
				paddingBottom: 'calc(var(--spacing-unit) * 0.75)',
			}}
		>
			<CircleIcon color={statusColor} fontSize={12} />
			<Typography
				style={{
					fontSize: '0.875rem',
					minWidth: '48px',
					flexShrink: 0,
				}}
			>
				{diskno}
			</Typography>
			<Typography
				style={{
					fontSize: '0.875rem',
					flexGrow: 1,
				}}
				color="secondary"
			>
				{status}
			</Typography>
			<Typography
				style={{
					fontSize: '0.75rem',
					minWidth: '50px',
					textAlign: 'right',
					flexShrink: 0,
				}}
				color="secondary"
			>
				{bytesToTerabytes(capacity).toFixed(1)} TB
			</Typography>
			<Typography
				style={{
					fontSize: '0.75rem',
					minWidth: '36px',
					textAlign: 'right',
					flexShrink: 0,
				}}
				color="secondary"
			>
				{celsiusToFahrenheit(temp).toFixed(0)}°F
			</Typography>
		</Box>
	);
}

function NasStorageCardContent() {
	const { isLoading, isError, data } = useNasDiagnostics();

	if (isError) {
		return (
			<Typography
				color="error"
				style={{
					paddingTop: 'calc(var(--spacing-unit) * 2)',
					paddingBottom: 'calc(var(--spacing-unit) * 2)',
				}}
			>
				Failed to load NAS storage data
			</Typography>
		);
	}

	if (isLoading || !data) {
		return (
			<Box display="flex" flexDirection="column" gap={1}>
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} variant="rectangular" height={24} />
				))}
			</Box>
		);
	}

	const hdds = data.storage.hdd_info;
	// Use volume info for accurate capacity calculations (accounts for RAID)
	const totalUsedBytes = data.storage.vol_info.reduce(
		(acc, v) => acc + v.used_size,
		0
	);
	const totalCapacityBytes = data.storage.vol_info.reduce(
		(acc, v) => acc + v.total_size,
		0
	);
	const totalUsageTB = bytesToTerabytes(totalUsedBytes);
	const totalCapacityTB = bytesToTerabytes(totalCapacityBytes);
	const totalUsagePercent = (totalUsedBytes / totalCapacityBytes) * 100;

	return (
		<>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				style={{ marginBottom: 'calc(var(--spacing-unit) * 0.5)' }}
			>
				<Typography
					style={{ fontSize: '1.5rem', fontWeight: 500 }}
					variant="h3"
				>
					{totalUsageTB.toFixed(2)} / {totalCapacityTB.toFixed(2)} TB
				</Typography>
			</Box>
			<LinearProgress
				value={totalUsagePercent}
				color={totalUsagePercent > 90 ? 'error' : 'primary'}
				style={{
					height: 8,
					borderRadius: 'var(--border-radius)',
					marginBottom: 'calc(var(--spacing-unit) * 0.5)',
				}}
			/>
			<Typography
				style={{
					fontSize: '0.875rem',
					marginBottom: 'calc(var(--spacing-unit) * 1)',
				}}
				color="secondary"
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
						/>
					))}
			</Box>
		</>
	);
}

function NasStorageCard() {
	return (
		<StyledCard>
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					style={{ marginBottom: 'calc(var(--spacing-unit) * 0.5)' }}
				>
					<StorageIcon
						fontSize={20}
						style={{
							marginRight: 'calc(var(--spacing-unit) * 1)',
							marginBottom: '2px',
						}}
					/>
					<Typography style={{ fontSize: '1.25rem' }} variant="h2">
						NAS Storage
					</Typography>
				</Box>
				<NasStorageCardContent />
			</StyledCardContent>
		</StyledCard>
	);
}

export default NasStorageCard;
