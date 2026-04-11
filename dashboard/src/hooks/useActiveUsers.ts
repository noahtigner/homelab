import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../services/api/utils';
import { activePerDaySchema } from '../types/schemas';

export const useActiveUsers = () => {
	return useQuery({
		queryKey: ['analytics', 'activeUsers'],
		refetchInterval: 1000 * 60 * 60, // 1 hour
		queryFn: () =>
			getRequest('/a/active_users/', activePerDaySchema).then(
				(res) => res.data
			),
	});
};
