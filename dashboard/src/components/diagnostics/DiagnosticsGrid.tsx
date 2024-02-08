import axios from 'axios';
import {
	SaveOutlined as SaveIcon,
	DeviceThermostatOutlined as DeviceThermostatOutlinedIcon,
	MemoryOutlined as MemoryIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import DiagnosticsCard from './DiagnosticsCard';
import { celsiusToFahrenheit } from '../../utils/unitConversion';

interface DiagnosticsData {
	cpu: {
		count: number;
		percent: number[];
		temp: number;
	};
	memory: {
		total: number;
		used: number;
		available: number;
		percent: number;
	};
	disk: {
		total: number;
		used: number;
		available: number;
		percent: number;
	};
	pids: number[];
}

function DiagnosticsGrid() {
	const { isPending, error, data } = useQuery({
		queryKey: ['diagnostics'],
		refetchInterval: 1000 * 5, // 5 seconds
		queryFn: () =>
			axios.get<DiagnosticsData>('/diagnostics/').then((res) => res.data),
	});

	if (isPending || error) {
		return null;
	}

	return (
		<>
			<DiagnosticsCard
				title="CPU"
				// value1={diagnosticsData.cpu.percent
				//   .map((percent) => `${percent}%`)
				//   .join(', ')}
				values={[
					`${Math.max(...data.cpu.percent).toFixed(2)}% max`,
					`${(
						data.cpu.percent.reduce((acc, c) => acc + c, 0) /
						data.cpu.percent.length
					).toFixed(2)}% avg`,
				]}
				icon={<MemoryIcon color="success" sx={{ fontSize: 48 }} />}
			/>
			<DiagnosticsCard
				title="Memory"
				values={[`${data.memory.percent.toFixed(1)}%`]}
				icon={<MemoryIcon color="success" sx={{ fontSize: 48 }} />}
			/>
			<DiagnosticsCard
				title="Disk"
				values={[`${data.disk.percent.toFixed(1)}%`]}
				icon={<SaveIcon color="success" sx={{ fontSize: 48 }} />}
			/>
			<DiagnosticsCard
				title="Temperature"
				values={[`${celsiusToFahrenheit(data.cpu.temp).toFixed(1)}°F`]}
				icon={
					<DeviceThermostatOutlinedIcon
						color="success"
						sx={{ fontSize: 48 }}
					/>
				}
			/>
		</>
	);
}

export default DiagnosticsGrid;
