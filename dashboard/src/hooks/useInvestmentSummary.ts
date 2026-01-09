import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../services/api/utils';
import { investmentSummaryDataSchema } from '../types/schemas';

export const useInvestmentSummary = () => {
	return useQuery({
		queryKey: ['investmentSummary'],
		refetchInterval: 1000 * 60 * 15, // 15 minutes
		queryFn: () =>
			getRequest('/money/portfolio/', investmentSummaryDataSchema).then(
				(res) => res.data
			),
	});
};
