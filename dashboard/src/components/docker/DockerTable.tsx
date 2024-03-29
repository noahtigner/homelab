import {
	TableContainer,
	Paper,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Skeleton,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface DockerData {
	containers: {
		id: string;
		name: string;
		cpu_usage: number;
		memory_usage: number;
		memory_limit: number;
		network_in: number;
		network_out: number;
		network_dropped: number;
		block_in: number;
		block_out: number;
		pids: number;
	}[];
	system_cpu_usage: number;
}

const bitsToMegabits = (bits: number): string => (bits / 1000000).toFixed(2);
const bitsToGigabytes = (bits: number): string =>
	(bits / 1000000000).toFixed(2);

function DockerTable() {
	const { isPending, isSuccess, error, data } = useQuery({
		queryKey: ['dockerStats'],
		refetchInterval: 1000 * 60 * 2, // 2 minutes
		queryFn: () =>
			axios.get<DockerData>(`/docker/stats/`).then((res) => res.data),
	});

	return (
		<TableContainer component={Paper}>
			<Table aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>Container Name</TableCell>
						{/* <TableCell>CPU Usage ()</TableCell> */}
						<TableCell>CPU %</TableCell>
						<TableCell>Memory Usage / Limit</TableCell>
						{/* <TableCell>Memory Limit (GB)</TableCell> */}
						<TableCell>Network I/O</TableCell>
						{/* <TableCell>Network Out</TableCell> */}
						<TableCell>Network Dropped</TableCell>
						<TableCell>Block I/O</TableCell>
						{/* <TableCell>Block Out</TableCell> */}
						<TableCell>PIDs</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{isPending && (
						<>
							{[...Array(5)].map((_, index) => (
								<TableRow key={index}>
									<TableCell colSpan={999}>
										<Skeleton variant="text" width="100%" />
									</TableCell>
								</TableRow>
							))}
						</>
					)}
					{error && (
						<TableRow>
							<TableCell colSpan={999} align="center">
								{error.message}
							</TableCell>
						</TableRow>
					)}
					{isSuccess &&
						data.containers.map((container) => (
							<TableRow
								key={container.name}
								sx={{
									'&:last-child td, &:last-child th': {
										border: 0,
									},
								}}
							>
								<TableCell component="th" scope="row">
									{container.name}
								</TableCell>
								{/* <TableCell>{container.cpu_usage}</TableCell> */}
								<TableCell>
									{(
										(container.cpu_usage /
											data.system_cpu_usage) *
										100
									).toFixed(2)}
								</TableCell>
								<TableCell>
									{`${bitsToMegabits(
										container.memory_usage
									)}Mb / ${bitsToGigabytes(
										container.memory_limit
									)}GB`}
								</TableCell>
								{/* <TableCell>
                      {bitsToGigabytes(container.memory_limit)}
                    </TableCell> */}
								<TableCell>
									{`${bitsToMegabits(
										container.network_in
									)}Mb / ${bitsToMegabits(
										container.network_out
									)}Mb`}
								</TableCell>
								{/* <TableCell>{bitsToMegabits(container.network_in)}</TableCell>
                <TableCell>{bitsToMegabits(container.network_out)}</TableCell> */}
								<TableCell>
									{bitsToMegabits(container.network_dropped)}
								</TableCell>
								<TableCell>
									{`${bitsToMegabits(
										container.block_in
									)} / ${bitsToMegabits(
										container.block_out
									)}`}
								</TableCell>
								{/* <TableCell>{bitsToMegabits(container.block_out)}</TableCell> */}
								<TableCell>{container.pids}</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

export default DockerTable;
