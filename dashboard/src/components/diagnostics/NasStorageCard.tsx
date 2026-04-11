import { HardDrive, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useNasDiagnostics } from '../../hooks/useNasDiagnostics';
import {
	bytesToTerabytes,
	celsiusToFahrenheit,
} from '../../services/unitConversion';

function getStatusColor(status: string): string {
	const normalStatuses = ['normal', 'initialized'];
	const warningStatuses = ['warning'];
	const errorStatuses = ['crashed', 'error', 'failing', 'failed'];
	const lowerStatus = status.toLowerCase();
	if (normalStatuses.includes(lowerStatus)) {
		return 'text-success-foreground';
	}
	if (warningStatuses.includes(lowerStatus)) {
		return 'text-warning-foreground';
	}
	if (errorStatuses.includes(lowerStatus)) {
		return 'text-destructive-foreground';
	}
	return 'text-primary';
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
	return (
		<div className="flex items-center gap-2 py-0.5">
			<Circle
				size={8}
				className={cn('shrink-0 fill-current', getStatusColor(status))}
			/>
			<span className="min-w-[40px] shrink-0 text-xs">{diskno}</span>
			<span className="grow text-xs text-muted-foreground">{status}</span>
			<span className="min-w-[44px] shrink-0 text-right text-xs text-muted-foreground">
				{bytesToTerabytes(capacity).toFixed(1)} TB
			</span>
			<span className="min-w-[32px] shrink-0 text-right text-xs text-muted-foreground">
				{celsiusToFahrenheit(temp).toFixed(0)}°F
			</span>
		</div>
	);
}

function NasStorageCardContent() {
	const { isLoading, isError, data } = useNasDiagnostics();

	if (isError) {
		return (
			<p className="py-2 text-destructive-foreground">
				Failed to load NAS storage data
			</p>
		);
	}

	if (isLoading || !data) {
		return (
			<div className="flex flex-col gap-2">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} className="h-6 w-full" />
				))}
			</div>
		);
	}

	const hdds = data.storage.hdd_info;
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
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium">
					{totalUsageTB.toFixed(2)} / {totalCapacityTB.toFixed(2)} TB
				</h3>
			</div>
			<Progress
				value={totalUsagePercent}
				className={cn(
					'mb-0.5 h-1.5',
					totalUsagePercent > 90 &&
						'[&_[data-slot=progress-indicator]]:bg-destructive'
				)}
			/>
			<p className="mb-1 text-xs text-muted-foreground">
				{totalUsagePercent.toFixed(1)}% used across {hdds.length} drives
			</p>
			<div>
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
			</div>
		</>
	);
}

function NasStorageCard() {
	return (
		<Card size="sm">
			<CardContent>
				<div className="mb-0.5 flex items-center">
					<HardDrive size={16} className="mr-1.5" />
					<h2 className="text-base">NAS Storage</h2>
				</div>
				<NasStorageCardContent />
			</CardContent>
		</Card>
	);
}

export default NasStorageCard;
