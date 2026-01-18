import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../services/api/utils';
import { plexSessionsResponseSchema } from '../types/schemas';

export const usePlexSessions = () => {
	return useQuery({
		queryKey: ['plex', 'sessions'],
		refetchInterval: 1000 * 15, // 15 seconds (sessions change frequently)
		queryFn: () =>
			getRequest('/plex/sessions/', plexSessionsResponseSchema).then(
				(res) => res.data
			),
	});
};
