import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useInvestmentSummary } from './useInvestmentSummary';
import * as apiUtils from '../services/api/utils';

// Mock the getRequest function
vi.mock('../services/api/utils', () => ({
	getRequest: vi.fn(),
}));

describe('useInvestmentSummary', () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		});
		vi.clearAllMocks();
	});

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	it('should fetch investment summary data successfully', async () => {
		const mockData = {
			totalValue: 100000,
			totalGain: 10000,
			totalGainPercent: 10,
		};

		vi.mocked(apiUtils.getRequest).mockResolvedValue({
			data: mockData,
			status: 200,
			statusText: 'OK',
			headers: {},
			config: {} as any,
		});

		const { result } = renderHook(() => useInvestmentSummary(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toEqual(mockData);
		expect(apiUtils.getRequest).toHaveBeenCalledWith(
			'/money/portfolio/',
			expect.any(Object)
		);
	});

	it('should handle error when fetching investment summary', async () => {
		const mockError = new Error('Failed to fetch');
		vi.mocked(apiUtils.getRequest).mockRejectedValue(mockError);

		const { result } = renderHook(() => useInvestmentSummary(), { wrapper });

		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(result.current.error).toBeTruthy();
	});

	it('should be in loading state initially', () => {
		vi.mocked(apiUtils.getRequest).mockImplementation(
			() => new Promise(() => {})
		);

		const { result } = renderHook(() => useInvestmentSummary(), { wrapper });

		expect(result.current.isLoading).toBe(true);
		expect(result.current.data).toBeUndefined();
	});
});
