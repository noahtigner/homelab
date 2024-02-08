import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
	CheckCircle as CheckCircleIcon,
	SaveOutlined as SaveIcon,
	DeviceThermostatOutlined as DeviceThermostatOutlinedIcon,
	MemoryOutlined as MemoryIcon,
} from '@mui/icons-material';
import LeetCodeSummaryCard from './components/leetcode/LeetCodeSummaryCard';
import DockerTable from './components/docker/DockerTable';
import NPMPackageCard from './components/npm/NPMPackageCard';
import GithubSummaryCard from './components/github/GithubSummaryCard';
import PiholeStatus from './components/pihole/PiholeStatus';
import { DiagnosticsCard, StatusStack } from './components/diagnostics';
import { celsiusToFahrenheit } from './utils/unitConversion';

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

function Diagnostics() {
	const [diagnosticsData, setDiagnosticsData] =
		useState<DiagnosticsData | null>(null);

	useEffect(() => {
		axios
			.get(`${import.meta.env.VITE_API_BASE}/diagnostics/`)
			.then(({ data }) => {
				console.log(data);
				setDiagnosticsData(data);
			})
			.catch((error) => console.log(error));
	}, []);

	return (
		<Box sx={{ marginTop: '8px' }}>
			<Grid container spacing={2}>
				<Grid xs={12} sm={3} md={2}>
					<StatusStack />
				</Grid>
				{/* <Box
          sx={{
            display: 'flex',
            // justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            marginY: '16px',
          }}
        >
          <StatusChip label="Pihole" status={piholeHealth} />
          <StatusChip label="API" status={diagnosticsData ? 'ok' : 'loading'} />
          <Chip color="warning" icon={<CheckCircleIcon />} label="Traefik" />
          <Chip color="error" icon={<CheckCircleIcon />} label="Dashboard" />
          <Chip disabled icon={<CheckCircleIcon />} label="Disabled" />
        </Box> */}
				<Grid container spacing={2} xs={12} sm={9} md={10}>
					{diagnosticsData && (
						<>
							<DiagnosticsCard
								title="CPU"
								// value1={diagnosticsData.cpu.percent
								//   .map((percent) => `${percent}%`)
								//   .join(', ')}
								values={[
									`${Math.max(
										...diagnosticsData.cpu.percent
									).toFixed(2)}% max`,
									`${(
										diagnosticsData.cpu.percent.reduce(
											(acc, c) => acc + c,
											0
										) / diagnosticsData.cpu.percent.length
									).toFixed(2)}% avg`,
								]}
								icon={
									<MemoryIcon
										color="success"
										sx={{ fontSize: 48 }}
									/>
								}
							/>
							<DiagnosticsCard
								title="Memory"
								values={[
									`${diagnosticsData.memory.percent.toFixed(
										1
									)}%`,
								]}
								icon={
									<MemoryIcon
										color="success"
										sx={{ fontSize: 48 }}
									/>
								}
							/>
							<DiagnosticsCard
								title="Disk"
								values={[
									`${diagnosticsData.disk.percent.toFixed(
										1
									)}%`,
								]}
								icon={
									<SaveIcon
										color="success"
										sx={{ fontSize: 48 }}
									/>
								}
							/>
							<DiagnosticsCard
								title="Temperature"
								values={[
									`${celsiusToFahrenheit(
										diagnosticsData.cpu.temp
									).toFixed(1)}°F`,
								]}
								icon={
									<DeviceThermostatOutlinedIcon
										color="success"
										sx={{ fontSize: 48 }}
									/>
								}
							/>
						</>
					)}
					<PiholeStatus />
				</Grid>
				<Grid xs={12} sm={6} lg={4}>
					<LeetCodeSummaryCard />
				</Grid>
				<Grid xs={12} sm={6} lg={4}>
					<NPMPackageCard packageName="validate-env-vars" />
				</Grid>
				<Grid xs={12} sm={6} lg={4}>
					<GithubSummaryCard />
				</Grid>
				<Grid xs={12}>
					<DockerTable />
				</Grid>
			</Grid>
			<List dense>
				<ListItem>
					<ListItemIcon>
						<CheckCircleIcon color="success" />
					</ListItemIcon>
					<ListItemText
						primary="Single-line item"
						// secondary={secondary ? 'Secondary text' : null}
						secondary="Secondary text"
					/>
				</ListItem>
			</List>
		</Box>
	);
}

export default Diagnostics;
