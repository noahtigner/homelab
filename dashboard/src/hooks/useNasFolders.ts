import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../services/api/utils';
import { nasFoldersSchema } from '../types/schemas';

export const useNasFolders = (folder: string = '/media') => {
	return useQuery({
		queryKey: ['nas', 'folders', folder],
		refetchInterval: 1000 * 60 * 5, // 5 minutes
		queryFn: () =>
			getRequest(
				`/nas/folders/?folder=${encodeURIComponent(folder)}`,
				nasFoldersSchema
			).then((res) => res.data),
	});
};
