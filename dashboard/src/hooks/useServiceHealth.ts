import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../services/api/utils';
import { serviceStatusSchema } from '../types/schemas';

export const useServiceHealth = (endpoint: string, queryKey: string[]) => {
	return useQuery({
		queryKey: [...queryKey, endpoint],
		refetchInterval: 1000 * 60, // 1 minute
		queryFn: () =>
			getRequest(endpoint, serviceStatusSchema).then((res) => res.data),
	});
};
