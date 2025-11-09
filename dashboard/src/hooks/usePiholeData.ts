import { useQuery } from '@tanstack/react-query';
import z from 'zod';
import { getRequest } from '../services/api/utils';

const piholeSummarySchema = z.object({
	sum_queries: z.number(),
	sum_blocked: z.number(),
	percent_blocked: z.number(),
	total_clients: z.number(),
	gravity: z.number(),
	qps: z.number(),
	uptime: z.number(),
	percent_mem: z.number(),
	percent_cpu: z.number(),
});

export const usePiholeSummary = () => {
	return useQuery({
		queryKey: ['pihole', 'summary'],
		refetchInterval: 1000 * 30, // 30 seconds
		queryFn: () =>
			getRequest('/pihole/summary/', piholeSummarySchema).then(
				(res) => res.data
			),
	});
};
