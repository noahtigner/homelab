import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../services/api/utils';
import { npmPackageInfoSchema } from '../types/schemas';

export const useNpmPackage = (packageName: string) => {
	return useQuery({
		queryKey: ['npm', packageName],
		refetchInterval: 1000 * 60 * 30, // 30 minutes
		queryFn: () =>
			getRequest(`/npm/${packageName}/`, npmPackageInfoSchema).then(
				(res) => res.data
			),
	});
};
