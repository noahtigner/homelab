import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { getRequest, postRequest } from '@/services/api/utils';
import { leetCodeActivitySchema } from '@/types/schemas';

const queryKey = ['leetcode', 'calendar'] as const;

export function useLeetCodeActivity() {
	return useQuery<z.infer<typeof leetCodeActivitySchema>>({
		queryKey,
		staleTime: 60_000,
		retry: false,
		refetchInterval: (query) =>
			['pending', 'syncing', 'partial'].includes(
				query.state.data?.sync_status ?? ''
			)
				? 5_000
				: 15 * 60_000,
		queryFn: ({ signal }) =>
			getRequest('/leetcode/calendar/', leetCodeActivitySchema, {
				signal,
			}).then((response) => response.data),
	});
}

export function useSyncLeetCodeActivity() {
	const client = useQueryClient();
	return useMutation({
		mutationFn: () =>
			postRequest(
				'/leetcode/calendar/sync/',
				{},
				z.object({ status: z.literal('scheduled') })
			),
		onSuccess: () => client.invalidateQueries({ queryKey }),
	});
}
