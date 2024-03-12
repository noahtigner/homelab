import { Stack } from '@mui/material';
import axios from 'axios';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import StatusChip from './StatusChip';
import type { ServiceStatus } from '../../types';

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

function StatusStack() {
	const apiHealth = useQuery({
		queryKey: ['apiHealth'],
		refetchInterval: 1000 * 60, // 1 minute
		queryFn: () =>
			axios.get<{ status: ServiceStatus }>('/').then((res) => res.data),
	});

	const slackBotHealth = useQuery({
		queryKey: ['slackBotHealth'],
		refetchInterval: 1000 * 60, // 1 minute
		queryFn: () =>
			axios
				.get<{ status: ServiceStatus }>('/docker/container/slack_bot/')
				.then((res) => res.data),
	});

	const piholeHealth = useQuery({
		queryKey: ['piholeHealth'],
		refetchInterval: 1000 * 60 * 5, // 5 minutes
		queryFn: () =>
			axios
				.get<{ status: ServiceStatus }>('/pihole/')
				.then((res) => res.data),
		retry: false,
	});

	const traefikHealth = useQuery({
		queryKey: ['traefikHealth'],
		refetchInterval: 1000 * 60, // 1 minute
		queryFn: () =>
			axios
				.get<{ status: ServiceStatus }>(
					'/docker/container/reverse_proxy/'
				)
				.then((res) => res.data),
	});

	const redisHealth = useQuery({
		queryKey: ['redisHealth'],
		refetchInterval: 1000 * 60, // 1 minute
		queryFn: () =>
			axios
				.get<{ status: ServiceStatus }>('/cache/')
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
			<StatusChip label="Dashboard" status="ok" />
			<StatusChip label="API" status={getServiceStatus(apiHealth)} />
			<StatusChip
				label="Pihole"
				status={getServiceStatus(piholeHealth)}
			/>
			<StatusChip
				label="Traefik"
				status={getServiceStatus(traefikHealth)}
			/>
			<StatusChip
				label="Slack Bot"
				status={getServiceStatus(slackBotHealth)}
			/>
			<StatusChip label="Cache" status={getServiceStatus(redisHealth)} />
		</Stack>
	);
}

export default StatusStack;
