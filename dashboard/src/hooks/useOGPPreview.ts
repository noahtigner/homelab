import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../services/api/utils';
import { ogpPreviewSchema } from '../types/schemas';

export const useOGPPreview = () => {
	return useQuery({
		queryKey: ['ogpPreview'],
		retry: false,
		queryFn: () =>
			getRequest('/portfolio/ogp/', ogpPreviewSchema).then(
				(res) => res.data
			),
	});
};
