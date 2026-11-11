import { useQuery } from '@tanstack/react-query';
import type { z } from 'zod';
import { getRequest } from '@/services/api/utils';
import { netWorthHistorySchema } from '@/types/schemas';
import {
	getNetWorthDateRange,
	type NetWorthPeriod,
} from '@/lib/netWorthHistory';

export type NetWorthHistoryData = z.infer<typeof netWorthHistorySchema>;
export type NetWorthSnapshot = NetWorthHistoryData['snapshots'][number];

export function useNetWorthHistory(period: NetWorthPeriod) {
	const { start_date, end_date } = getNetWorthDateRange(period);
	return useQuery({
		queryKey: ['netWorthHistory', start_date ?? null, end_date],
		staleTime: 1000 * 60 * 5,
		refetchInterval: 1000 * 60 * 15,
		queryFn: ({ signal }) =>
			getRequest('/money/net-worth-history/', netWorthHistorySchema, {
				params: { start_date, end_date },
				signal,
			}).then((response) => response.data),
	});
}
