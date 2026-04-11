import { AxiosInstance } from 'axios';
import { HardDrive, Thermometer, Cpu } from 'lucide-react';

import DiagnosticsCard from './DiagnosticsCard';
import { celsiusToFahrenheit } from '../../services/unitConversion';
import { useDiagnostics } from '../../hooks/useDiagnostics';
import type { z } from 'zod';
import type { diagnosticsDataSchema } from '../../types/schemas';

type DiagnosticsData = z.infer<typeof diagnosticsDataSchema>;

const iconClass = 'size-9 text-success-foreground';

const cardItems = [
	{
		id: 0,
		title: 'CPU',
		values: (data: DiagnosticsData) => [
			`${Math.max(...data.cpu.percent).toFixed(2)}% max`,
			`${(
				data.cpu.percent.reduce((acc, c) => acc + c, 0) /
				data.cpu.percent.length
			).toFixed(2)}% avg`,
		],
		icon: <Cpu className={iconClass} />,
	},
	{
		id: 1,
		title: 'Memory',
		values: (data: DiagnosticsData) => [
			`${data.memory.percent.toFixed(1)}%`,
		],
		icon: <Cpu className={iconClass} />,
	},
	{
		id: 2,
		title: 'Disk',
		values: (data: DiagnosticsData) => [`${data.disk.percent.toFixed(1)}%`],
		icon: <HardDrive className={iconClass} />,
	},
	{
		id: 3,
		title: 'Temperature',
		values: (data: DiagnosticsData) =>
			data.cpu.temp
				? [`${celsiusToFahrenheit(data.cpu.temp).toFixed(1)}°F`]
				: [],
		icon: <Thermometer className={iconClass} />,
	},
];

function DiagnosticsGrid({ client }: { client: AxiosInstance }) {
	const { isPending, error, data } = useDiagnostics(
		client,
		'/diagnostics/diagnostics/'
	);

	return (
		<>
			{cardItems.map((item) => (
				<div
					key={item.id}
					className="col-span-12 sm:col-span-6 md:col-span-3"
				>
					<DiagnosticsCard
						title={item.title}
						values={
							isPending || error || !data
								? ['An unexpected error occurred']
								: item.values(data)
						}
						icon={item.icon}
						loading={isPending}
					/>
				</div>
			))}
		</>
	);
}

export default DiagnosticsGrid;
