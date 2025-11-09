import { Stack } from '@mui/material';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import StatusChip from './StatusChip';
import type { ServiceStatus } from '../../types';
import { servicesClient } from '../../services/api';

function getServiceStatus(
	queryResult: UseQueryResult<{ status: ServiceStatus }>
): ServiceStatus {
	const { isLoading, isError, data } = queryResult;
	if (isLoading) {
		return 'loading';
	}
	if (isError) {
		return 'error';
	}
	return data?.status || 'error';
}

function StatusStackPrimary() {
	// common services
	const diagnosticsHealth = useQuery({
		queryKey: ['primary', 'diagnosticsHealth'],
		refetchInterval: 1000 * 60, // 1 minute
		queryFn: () =>
			servicesClient
				.get<{ status: ServiceStatus }>('/diagnostics/')
				.then((res) => res.data),
	});
	const traefikHealth = useQuery({
		queryKey: ['primary', 'traefikHealth'],
		refetchInterval: 1000 * 60, // 1 minute
		queryFn: () =>
			servicesClient
				.get<{
					status: ServiceStatus;
				}>('/diagnostics/docker/container/reverse_proxy/')
				.then((res) => res.data),
	});
	const redisHealth = useQuery({
		queryKey: ['primary', 'redisHealth'],
		refetchInterval: 1000 * 60, // 1 minute
		queryFn: () =>
			servicesClient
				.get<{ status: ServiceStatus }>('/cache/')
				.then((res) => res.data),
	});
	// unique services
	const servicesHealth = useQuery({
		queryKey: ['primary', 'servicesHealth'],
		refetchInterval: 1000 * 60, // 1 minute
		queryFn: () =>
			servicesClient
				.get<{ status: ServiceStatus }>('/')
				.then((res) => res.data),
	});
	const slackBotHealth = useQuery({
		queryKey: ['primary', 'slackBotHealth'],
		refetchInterval: 1000 * 60, // 1 minute
		queryFn: () =>
			servicesClient
				.get<{
					status: ServiceStatus;
				}>('/diagnostics/docker/container/slack_bot/')
				.then((res) => res.data),
	});
	const speedtestHealth = useQuery({
		queryKey: ['primary', 'speedtestHealth'],
		refetchInterval: 1000 * 60, // 1 minute
		queryFn: () =>
			servicesClient
				.get<{
					status: ServiceStatus;
				}>('/diagnostics/docker/container/speedtest/')
				.then((res) => res.data),
	});

	return (
		<Stack
			direction="column"
			// direction="row"
			justifyContent="flex-start"
			// alignItems="flex-start"
			alignItems="stretch"
			spacing={1}
		>
			<StatusChip
				label="Traefik"
				status={getServiceStatus(traefikHealth)}
				url={import.meta.env.VITE_TRAEFIK_BASE}
			/>
			<StatusChip label="Cache" status={getServiceStatus(redisHealth)} />
			<StatusChip
				label="API: Diagnostics"
				status={getServiceStatus(diagnosticsHealth)}
				url={`${import.meta.env.VITE_API_BASE}/diagnostics/docs/`}
			/>
			<StatusChip
				label="API: Services"
				status={getServiceStatus(servicesHealth)}
				url={`${import.meta.env.VITE_API_BASE}/docs/`}
			/>
			<StatusChip
				label="Slack Bot"
				status={getServiceStatus(slackBotHealth)}
			/>
			<StatusChip
				label="Speed Test"
				status={getServiceStatus(speedtestHealth)}
			/>
			<StatusChip label="Dashboard" status="ok" />
		</Stack>
	);
}

export { StatusStackPrimary };
