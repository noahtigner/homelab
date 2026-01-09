import { AxiosInstance } from 'axios';
import {
	SaveOutlined as SaveIcon,
	DeviceThermostatOutlined as DeviceThermostatOutlinedIcon,
	MemoryOutlined as MemoryIcon,
} from '@mui/icons-material';

import DiagnosticsCard from './DiagnosticsCard';
import { celsiusToFahrenheit } from '../../services/unitConversion';
import { useDiagnostics } from '../../hooks/useDiagnostics';
import type { z } from 'zod';
import type { diagnosticsDataSchema } from '../../types/schemas';

type DiagnosticsData = z.infer<typeof diagnosticsDataSchema>;

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
		icon: <MemoryIcon color="success" sx={{ fontSize: 36 }} />,
	},
	{
		id: 1,
		title: 'Memory',
		values: (data: DiagnosticsData) => [
			`${data.memory.percent.toFixed(1)}%`,
		],
		icon: <MemoryIcon color="success" sx={{ fontSize: 36 }} />,
	},
	{
		id: 2,
		title: 'Disk',
		values: (data: DiagnosticsData) => [`${data.disk.percent.toFixed(1)}%`],
		icon: <SaveIcon color="success" sx={{ fontSize: 36 }} />,
	},
	{
		id: 3,
		title: 'Temperature',
		values: (data: DiagnosticsData) =>
			data.cpu.temp
				? [`${celsiusToFahrenheit(data.cpu.temp).toFixed(1)}°F`]
				: [],
		icon: (
			<DeviceThermostatOutlinedIcon
				color="success"
				sx={{ fontSize: 36 }}
			/>
		),
	},
];

function DiagnosticsGrid({ client }: { client: AxiosInstance }) {
	const { isPending, error, data } = useDiagnostics(client);

	return (
		<>
			{cardItems.map((item) => (
				<DiagnosticsCard
					key={item.id}
					title={item.title}
					values={
						isPending || error || !data
							? ['An unexpected error occurred']
							: item.values(data)
					}
					icon={item.icon}
					loading={isPending}
				/>
			))}
		</>
	);
}

export default DiagnosticsGrid;
