import { ReactNode, useEffect, useState } from 'react';
import axios from 'axios';
import {
	Box,
	Chip,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Stack,
	Typography,
	useTheme,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
	CheckCircle as CheckCircleIcon,
	DnsOutlined as DnsIcon,
	Block as BlockIcon,
	AccessTime as AccessTimeIcon,
	SaveOutlined as SaveIcon,
	DeviceThermostatOutlined as DeviceThermostatOutlinedIcon,
	MemoryOutlined as MemoryIcon,
	CircleOutlined as CircleIcon,
	ErrorOutlineOutlined as ErrorCircleIcon,
} from '@mui/icons-material';
import { StyledCard, StyledCardContent } from './components/StyledCard';
import LeetCodeSummaryCard from './components/leetcode/LeetCodeSummaryCard';
import DockerTable from './components/docker/DockerTable';
import ValidateEnvVarsCard from './components/npm/ValidateEnvVarsCard';

interface PiholeData {
	domains_being_blocked: number;
	dns_queries_today: number;
	ads_blocked_today: number;
	ads_percentage_today: number;
	unique_domains: number;
	queries_forwarded: number;
	queries_cached: number;
	clients_ever_seen: number;
	unique_clients: number;
	dns_queries_all_types: number;
	reply_NODATA: number;
	reply_NXDOMAIN: number;
	reply_CNAME: number;
	reply_IP: number;
	privacy_level: number;
	status: string;
	gravity_last_updated: {
		file_exists: boolean;
		absolute: number;
		relative: {
			days: number;
			hours: number;
			minutes: number;
		};
	};
}

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

const celsiusToFahrenheit = (celsius: number): number => (celsius * 9) / 5 + 32;

function PiholeSummaryCard({
	title,
	value1,
	value2,
	icon,
}: {
	title: string;
	value1: string | number;
	value2: string | number;
	icon: ReactNode;
}) {
	const theme = useTheme();

	return (
		<Grid xs={12} sm={6} md={4}>
			<StyledCard variant="outlined">
				<StyledCardContent>
					<Typography
						sx={{
							fontSize: '1.25rem',
							marginBottom: theme.spacing(0.5),
						}}
						variant="h2"
					>
						{title}
					</Typography>
					<Box
						sx={{
							display: 'flex',
							flexGrow: 1,
							justifyContent: 'space-between',
						}}
					>
						<Typography
							sx={{
								fontSize: '2.5rem',
								marginBottom: theme.spacing(0.5),
							}}
							variant="h3"
						>
							{value1}
						</Typography>
						{icon}
					</Box>
					<Typography sx={{ fontSize: '1rem' }} variant="h4">
						{value2}
					</Typography>
				</StyledCardContent>
			</StyledCard>
		</Grid>
	);
}

function DiagnosticsCard({
	title,
	values,
	icon,
}: {
	title: string;
	values: string[];
	icon: ReactNode;
}) {
	const theme = useTheme();

	return (
		<Grid xs={12} sm={6} md={3}>
			<StyledCard variant="outlined">
				<StyledCardContent>
					<Typography
						sx={{
							fontSize: '1.25rem',
							marginBottom: theme.spacing(0.5),
						}}
						variant="h2"
					>
						{title}
					</Typography>
					<Box
						sx={{
							display: 'flex',
							flexGrow: 1,
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<Box>
							{values.map((v) => (
								<Typography
									key={v}
									sx={{
										fontSize:
											values.length > 1
												? '1rem'
												: '2.5rem',
										wordBreak: 'break-word',
									}}
									variant={'h3'}
								>
									{v}
								</Typography>
							))}
						</Box>
						{icon}
					</Box>
				</StyledCardContent>
			</StyledCard>
		</Grid>
	);
}

type ServiceStatus = 'ok' | 'warning' | 'error' | 'loading';

const statusToColor = (status: ServiceStatus) => {
	switch (status) {
		case 'ok':
			return 'success';
		case 'warning':
			return 'warning';
		case 'error':
			return 'error';
		case 'loading':
		default:
			return 'default';
	}
};

const statusToIcon = (status: ServiceStatus) => {
	switch (status) {
		case 'ok':
			return <CheckCircleIcon />;
		case 'warning':
		case 'error':
			return <ErrorCircleIcon />;
		case 'loading':
		default:
			return <CircleIcon />;
	}
};

function StatusChip({
	label,
	status,
}: {
	label: string;
	status: ServiceStatus;
}) {
	return (
		<Chip
			label={label}
			color={statusToColor(status)}
			icon={statusToIcon(status)}
			sx={{ justifyContent: 'start' }}
			// sx={{
			//   paddingY: '4px',
			//   justifyContent: 'start',
			//   // height: 'auto',
			//   '& .MuiChip-label': {
			//     display: 'block',
			//     whiteSpace: 'normal',
			//   },
			// }}
		/>
	);
}

function Diagnostics() {
	const [piholeData, setPiholeData] = useState<PiholeData | null>(null);
	const [diagnosticsData, setDiagnosticsData] =
		useState<DiagnosticsData | null>(null);
	const [piholeHealth, setPiholeHealth] = useState<ServiceStatus>('loading');

	useEffect(() => {
		axios
			.get(`${import.meta.env.VITE_API_BASE}/diagnostics/`)
			.then(({ data }) => {
				console.log(data);
				setDiagnosticsData(data);
			})
			.catch((error) => console.log(error));

		axios
			.get(`${import.meta.env.VITE_API_BASE}/pihole/summary/`)
			.then(({ data }) => {
				console.log(data);
				setPiholeData(data);
			})
			.catch((error) => {
				console.log(error);
				setPiholeHealth('error');
			});

		axios
			.get(`${import.meta.env.VITE_API_BASE}/pihole/`)
			.then(({ data }) => {
				console.log(data);
				setPiholeHealth(data.status);
			})
			.catch((error) => {
				console.log(error);
				setPiholeHealth('error');
			});
	}, []);

	return (
		<Box sx={{ marginTop: '8px' }}>
			<Grid container spacing={2}>
				<Grid xs={12} sm={3} md={2}>
					<Stack
						direction="column"
						// direction="row"
						justifyContent="flex-start"
						// alignItems="flex-start"
						alignItems="stretch"
						spacing={1}
					>
						<StatusChip label="Dashboard" status="ok" />
						<StatusChip
							label="API"
							status={diagnosticsData ? 'ok' : 'loading'}
						/>
						<StatusChip label="Pihole" status={piholeHealth} />
						<StatusChip label="Traefik" status={'warning'} />
						<StatusChip label="Cache" status={'loading'} />
						<StatusChip label="Spotify API" status={'loading'} />
						{/* <StatusChip label="Nest API" status={'loading'} />
						<StatusChip
							label="Weather Forecast"
							status={'loading'}
						/> */}
					</Stack>
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
					{piholeData && (
						<>
							<PiholeSummaryCard
								title="DNS Queries Today"
								value1={Number(
									piholeData.dns_queries_today
								).toLocaleString()}
								value2={`${piholeData.unique_clients} unique clients`}
								icon={
									<DnsIcon
										color="success"
										sx={{ fontSize: 48 }}
									/>
								}
							/>
							<PiholeSummaryCard
								title="Ads Blocked Today"
								value1={Number(
									piholeData.ads_blocked_today
								).toLocaleString()}
								value2={`${Number(
									piholeData.ads_percentage_today
								).toFixed(2)}%`}
								icon={
									<AccessTimeIcon
										color="success"
										sx={{ fontSize: 48 }}
									/>
								}
							/>
							<PiholeSummaryCard
								title="Domains Being Blocked"
								value1={Number(
									piholeData.domains_being_blocked
								).toLocaleString()}
								value2={`Updated ${piholeData.gravity_last_updated.relative.days} days, ${piholeData.gravity_last_updated.relative.hours} hours, ${piholeData.gravity_last_updated.relative.minutes} minutes ago`}
								icon={
									<BlockIcon
										color="success"
										sx={{ fontSize: 48 }}
									/>
								}
							/>
						</>
					)}
				</Grid>
				<Grid xs={12}>
					<DockerTable />
				</Grid>
				<Grid xs={12} sm={6} lg={4}>
					<LeetCodeSummaryCard />
				</Grid>
				<Grid xs={12} sm={6} lg={4}>
					<ValidateEnvVarsCard packageName="validate-env-vars" />
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
