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

const piholeHistorySchema = z.object({
	window_start: z.number(),
	window_end: z.number(),
	interval_seconds: z.number().positive(),
	history: z.array(
		z.object({
			timestamp: z.number().nonnegative(),
			total: z.number().int().nonnegative(),
			blocked: z.number().int().nonnegative(),
		})
	),
});

export type PiholeHistoryData = z.infer<typeof piholeHistorySchema>;
export type PiholeSummaryData = z.infer<typeof piholeSummarySchema>;

export const usePiholeHistory = () => {
	return useQuery({
		queryKey: ['pihole', 'history'],
		staleTime: 1000 * 30,
		refetchInterval: 1000 * 30,
		queryFn: ({ signal }) =>
			getRequest('/pihole/history/', piholeHistorySchema, {
				signal,
			}).then((res) => res.data),
	});
};

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
