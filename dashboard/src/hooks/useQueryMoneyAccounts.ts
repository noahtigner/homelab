import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../services/api/utils';
import {
	netWorthSummaryDataSchema,
	accountTypeSummarySchema,
} from '../types/schemas';
import type { z } from 'zod';

export type AccountTypeSummary = z.infer<typeof accountTypeSummarySchema>;
export type NetWorthSummaryData = z.infer<typeof netWorthSummaryDataSchema>;

const useQueryMoneyAccounts = () => {
	return useQuery({
		queryKey: ['NetWorthSummary'],
		refetchInterval: 1000 * 60 * 15, // 15 minutes
		queryFn: () =>
			getRequest('/money/accounts/', netWorthSummaryDataSchema).then(
				(res) => res.data
			),
	});
};

export default useQueryMoneyAccounts;
