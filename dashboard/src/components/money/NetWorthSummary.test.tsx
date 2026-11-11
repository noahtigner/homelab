import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import NetWorthSummaryCard from './NetWorthSummary';
import { getRequest } from '../../services/api/utils';

vi.mock('../../services/api/utils', () => ({
	getRequest: vi.fn(),
}));

describe('NetWorthSummary errors', () => {
	const clients: QueryClient[] = [];

	afterEach(() => {
		clients.forEach((client) => client.clear());
		clients.length = 0;
		vi.clearAllMocks();
	});

	const renderWithError = (error: Error) => {
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		clients.push(client);
		vi.mocked(getRequest).mockRejectedValue(error);
		render(
			<QueryClientProvider client={client}>
				<NetWorthSummaryCard />
			</QueryClientProvider>
		);
	};

	it('displays the API renewal instructions', async () => {
		const detail =
			'Monarch authentication needs renewal. Replace the session and CSRF secrets and recreate the API container.';
		const config = { headers: new AxiosHeaders() };
		const error = new AxiosError(
			'Request failed with status code 503',
			'ERR_BAD_RESPONSE',
			config,
			undefined,
			{
				data: { detail },
				status: 503,
				statusText: 'Service Unavailable',
				headers: {},
				config,
			}
		);

		renderWithError(error);

		expect(await screen.findByText(detail)).toBeInTheDocument();
		expect(
			screen.getByText('Monarch Money unavailable')
		).toBeInTheDocument();
	});

	it.each([undefined, ['Unexpected detail shape'], '   '])(
		'falls back to the Axios message for detail %j',
		async (detail) => {
			const config = { headers: new AxiosHeaders() };
			renderWithError(
				new AxiosError(
					'Request failed',
					'ERR_BAD_RESPONSE',
					config,
					undefined,
					{
						data: { detail },
						status: 503,
						statusText: 'Service Unavailable',
						headers: {},
						config,
					}
				)
			);

			expect(
				await screen.findByText('Request failed')
			).toBeInTheDocument();
		}
	);

	it('falls back to a network error message', async () => {
		renderWithError(new Error('Network unavailable'));

		expect(
			await screen.findByText('Network unavailable')
		).toBeInTheDocument();
	});
});
