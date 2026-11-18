import { useQuery } from '@tanstack/react-query';
import { getRequest } from '@/services/api/utils';
import { githubContributionCalendarSchema } from '@/types/schemas';

export function useGithubContributions() {
	return useQuery({
		queryKey: ['github', 'contributions'],
		staleTime: 1000 * 60 * 15,
		refetchInterval: 1000 * 60 * 15,
		queryFn: ({ signal }) =>
			getRequest(
				'/github/contributions/',
				githubContributionCalendarSchema,
				{ signal }
			).then((response) => response.data),
	});
}
