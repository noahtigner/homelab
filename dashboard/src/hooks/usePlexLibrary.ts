import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../services/api/utils';
import { plexLibraryCountsResponseSchema } from '../types/schemas';

export const usePlexLibrary = () => {
	return useQuery({
		queryKey: ['plex', 'library', 'counts'],
		refetchInterval: 1000 * 60 * 5, // 5 minutes
		queryFn: () =>
			getRequest(
				'/plex/library/counts/',
				plexLibraryCountsResponseSchema
			).then((res) => res.data),
	});
};
