import { useQuery } from '@tanstack/react-query';
import { type AxiosInstance } from 'axios';
import { diagnosticsDataSchema } from '../types/schemas';

export const useDiagnostics = (
	client: AxiosInstance,
	endpoint: string = '/diagnostics/'
) => {
	return useQuery({
		queryKey: ['diagnostics', client.getUri(), endpoint],
		refetchInterval: 1000 * 5, // 5 seconds
		queryFn: () =>
			client
				.get(endpoint)
				.then((res) => diagnosticsDataSchema.parse(res.data)),
	});
};
