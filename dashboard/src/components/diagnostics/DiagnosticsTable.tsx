import { AxiosInstance } from 'axios';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { primaryClient } from '../../services/api';
import {
	celsiusToFahrenheit,
	bytesToTerabytes,
} from '../../services/unitConversion';
import { useNasDiagnostics } from '../../hooks/useNasDiagnostics';
import { useDiagnostics } from '../../hooks/useDiagnostics';

function NasDiagnosticsTableRow() {
	const { isLoading, isError, data } = useNasDiagnostics();

	if (isError) {
		return (
			<TableCell colSpan={999} className="text-center">
				An unexpected error occurred
			</TableCell>
		);
	}
	if (isLoading || !data) {
		return (
			<TableCell colSpan={999}>
				<Skeleton className="h-4 w-full" />
			</TableCell>
		);
	}

	const cpuMax: number = Math.max(...Object.values(data.utilization.cpu));
	const cpuAvg: number =
		Object.values(data.utilization.cpu).reduce((acc, c) => acc + c, 0) /
		Object.values(data.utilization.cpu).length;
	const memoryUsage: number = data.utilization.memory.real_usage;
	const diskUsageBytes: number = data.storage.vol_info.reduce(
		(acc, v) => acc + v.used_size,
		0
	);
	const diskCapacityBytes: number = data.storage.vol_info.reduce(
		(acc, v) => acc + v.total_size,
		0
	);
	const diskUsageTB: string = `${bytesToTerabytes(diskUsageBytes).toFixed(2)} TB`;
	const diskCapacityTB: string = `${bytesToTerabytes(diskCapacityBytes).toFixed(2)} TB`;
	const diskUsagePercent: number = (diskUsageBytes / diskCapacityBytes) * 100;

	return (
		<>
			<TableCell className="text-right">{`${cpuMax.toFixed(2)}%`}</TableCell>
			<TableCell className="text-right">{`${cpuAvg.toFixed(2)}%`}</TableCell>
			<TableCell className="text-right">{`${memoryUsage.toFixed(1)}%`}</TableCell>
			<TableCell className="text-right">{`${diskUsageTB} / ${diskCapacityTB} (${diskUsagePercent.toFixed(1)}%)`}</TableCell>
			<TableCell className="text-right">
				{`${celsiusToFahrenheit(data.core.sys_temp).toFixed(1)}°F`}
			</TableCell>
		</>
	);
}

function DiagnosticsTableRow({ client }: { client: AxiosInstance }) {
	const { isLoading, isError, data } = useDiagnostics(client);
	if (isError) {
		return (
			<TableCell colSpan={999} className="text-center">
				An unexpected error occurred
			</TableCell>
		);
	}
	if (isLoading || !data) {
		return (
			<TableCell colSpan={999}>
				<Skeleton className="h-4 w-full" />
			</TableCell>
		);
	}
	return (
		<>
			<TableCell className="text-right">
				{`${Math.max(...data.cpu.percent).toFixed(2)}%`}
			</TableCell>
			<TableCell className="text-right">
				{`${(
					data.cpu.percent.reduce((acc, c) => acc + c, 0) /
					data.cpu.percent.length
				).toFixed(2)}%`}
			</TableCell>
			<TableCell className="text-right">{`${data.memory.percent.toFixed(1)}%`}</TableCell>
			<TableCell className="text-right">{`${data.disk.percent.toFixed(1)}%`}</TableCell>
			<TableCell className="text-right">
				{data.cpu.temp
					? `${celsiusToFahrenheit(data.cpu.temp).toFixed(1)}°F`
					: null}
			</TableCell>
		</>
	);
}

function DashboardTable() {
	return (
		<Card className="overflow-hidden">
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Server</TableHead>
							<TableHead className="text-right">
								CPU (max)
							</TableHead>
							<TableHead className="text-right">
								CPU (avg)
							</TableHead>
							<TableHead className="text-right">Memory</TableHead>
							<TableHead className="text-right">Disk</TableHead>
							<TableHead className="text-right">
								Temperature
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="font-medium">
								Mini-PC
							</TableCell>
							<DiagnosticsTableRow client={primaryClient} />
						</TableRow>
						<TableRow>
							<TableCell className="font-medium">NAS</TableCell>
							<NasDiagnosticsTableRow />
						</TableRow>
					</TableBody>
				</Table>
			</div>
		</Card>
	);
}

export default DashboardTable;
