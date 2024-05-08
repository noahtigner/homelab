import { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';
import {
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';
import { piholeClient, primaryClient } from '../../services/api';
import { celsiusToFahrenheit } from '../../services/unitConversion';
import { StyledCard } from '../StyledCard';

interface DiagnosticsData {
	cpu: {
		count: number;
		percent: number[];
		temp: number | null;
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

function DiagnosticsTableRow({ client }: { client: AxiosInstance }) {
	const { isLoading, isError, data } = useQuery({
		queryKey: ['piholeDiagnostics', client.getUri()],
		refetchInterval: 1000 * 5, // 5 seconds
		queryFn: () =>
			client
				.get<DiagnosticsData>(`/diagnostics/`)
				.then((res) => res.data),
	});
	if (isError) {
		return (
			<TableCell
				component="th"
				scope="row"
				colSpan={999}
				sx={{ textAlign: 'center ' }}
			>
				An unexpected error occurred
			</TableCell>
		);
	}
	if (isLoading || !data) {
		return (
			<TableCell component="th" scope="row" colSpan={999}>
				<Skeleton variant="text" width="100%" />
			</TableCell>
		);
	}
	return (
		<>
			<TableCell align="right">
				{`${Math.max(...data.cpu.percent).toFixed(2)}%`}
			</TableCell>
			<TableCell align="right">
				{`${(
					data.cpu.percent.reduce((acc, c) => acc + c, 0) /
					data.cpu.percent.length
				).toFixed(2)}%`}
			</TableCell>
			<TableCell align="right">{`${data.memory.percent.toFixed(
				1
			)}%`}</TableCell>
			<TableCell align="right">{`${data.disk.percent.toFixed(
				1
			)}%`}</TableCell>
			<TableCell align="right">
				{data.cpu.temp
					? `${celsiusToFahrenheit(data.cpu.temp).toFixed(1)}°F`
					: null}
			</TableCell>
		</>
	);
}

function DashboardTable() {
	return (
		<StyledCard variant="outlined">
			<TableContainer>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Server</TableCell>
							<TableCell align="right">CPU (max)</TableCell>
							<TableCell align="right">CPU (avg)</TableCell>
							<TableCell align="right">Memory</TableCell>
							<TableCell align="right">Disk</TableCell>
							<TableCell align="right">Temperature</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							<TableCell component="th" scope="row">
								Primary
							</TableCell>
							<DiagnosticsTableRow client={primaryClient} />
						</TableRow>
						<TableRow>
							<TableCell component="th" scope="row">
								Pihole
							</TableCell>
							<DiagnosticsTableRow client={piholeClient} />
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>
		</StyledCard>
	);
}

export default DashboardTable;
