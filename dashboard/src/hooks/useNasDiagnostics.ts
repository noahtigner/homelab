import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../services/api/utils';
import { nasDiagnosticsSchema } from '../types/schemas';

export const useNasDiagnostics = () => {
	return useQuery({
		queryKey: ['diagnostics', 'NAS'],
		refetchInterval: 1000 * 30, // 30 seconds
		queryFn: () =>
			getRequest('/nas/system/', nasDiagnosticsSchema).then(
				(res) => res.data
			),
	});
};
