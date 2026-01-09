import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../services/api/utils';
import { speedTestSchema } from '../types/schemas';

export const useSpeedTest = () => {
	return useQuery({
		queryKey: ['speedtest'],
		refetchInterval: 1000 * 30, // 30 seconds
		queryFn: () =>
			getRequest('/speedtest/', speedTestSchema).then((res) => res.data),
	});
};
