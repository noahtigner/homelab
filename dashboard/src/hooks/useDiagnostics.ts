import { useQuery } from '@tanstack/react-query';
import { type AxiosInstance } from 'axios';
import { diagnosticsDataSchema } from '../types/schemas';

export const useDiagnostics = (client: AxiosInstance) => {
	return useQuery({
		queryKey: ['diagnostics', client.getUri()],
		refetchInterval: 1000 * 5, // 5 seconds
		queryFn: () =>
			client
				.get('/diagnostics/')
				.then((res) => diagnosticsDataSchema.parse(res.data)),
	});
};
