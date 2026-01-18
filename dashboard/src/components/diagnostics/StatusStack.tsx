import { Stack } from '../ui';
import { type UseQueryResult } from '@tanstack/react-query';

import StatusChip from './StatusChip';
import type { ServiceStatus } from '../../types';
import { useServiceHealth } from '../../hooks/useServiceHealth';
import type { z } from 'zod';
import type { serviceStatusSchema } from '../../types/schemas';

function getServiceStatus(
	queryResult: UseQueryResult<z.infer<typeof serviceStatusSchema>>
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
	const diagnosticsHealth = useServiceHealth('/diagnostics/', [
		'primary',
		'diagnosticsHealth',
	]);
	const traefikHealth = useServiceHealth(
		'/diagnostics/docker/container/reverse_proxy/',
		['primary', 'traefikHealth']
	);
	const redisHealth = useServiceHealth('/cache/', ['primary', 'redisHealth']);
	// unique services
	const servicesHealth = useServiceHealth('/', ['primary', 'servicesHealth']);
	const slackBotHealth = useServiceHealth(
		'/diagnostics/docker/container/slack_bot/',
		['primary', 'slackBotHealth']
	);
	const speedtestHealth = useServiceHealth(
		'/diagnostics/docker/container/speedtest/',
		['primary', 'speedtestHealth']
	);

	return (
		<Stack
			direction="column"
			justifyContent="flex-start"
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
