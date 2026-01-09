import { useQuery } from '@tanstack/react-query';
import { servicesClient } from '../services/api';
import { serviceStatusSchema } from '../types/schemas';

export const useServiceHealth = (endpoint: string, queryKey: string[]) => {
	return useQuery({
		queryKey: [...queryKey, endpoint],
		refetchInterval: 1000 * 60, // 1 minute
		queryFn: () =>
			servicesClient
				.get(endpoint)
				.then((res) => serviceStatusSchema.parse(res.data)),
	});
};
