import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../services/api/utils';
import { githubEventsSchema } from '../types/schemas';

export const useGithubEvents = () => {
	return useQuery({
		queryKey: ['github', 'events'],
		refetchInterval: 1000 * 60 * 15, // 15 minutes
		queryFn: () =>
			getRequest('/github/events/', githubEventsSchema).then(
				(res) => res.data
			),
	});
};
