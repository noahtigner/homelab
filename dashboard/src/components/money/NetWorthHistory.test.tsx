import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import type { ComponentProps, ReactNode } from 'react';
import { servicesClient } from '@/services/api/clients';
import { netWorthPeriods } from '@/lib/netWorthHistory';
import NetWorthHistory from './NetWorthHistory';
import NetWorthSummaryCard from './NetWorthSummary';

vi.mock('@/services/api/clients', () => ({
	servicesClient: { get: vi.fn() },
}));

// Give the real chart a stable size in jsdom, which has no layout engine.
vi.mock('recharts', async (importOriginal) => {
	const recharts = await importOriginal<typeof import('recharts')>();
	return {
		...recharts,
		ResponsiveContainer: ({
			children,
			onResize,
		}: {
			children: ReactNode;
			onResize?: (width: number, height: number) => void;
		}) => (
			<>
				<button onClick={() => onResize?.(320, 200)}>
					Resize narrow
				</button>
				<button onClick={() => onResize?.(1440, 200)}>
					Resize wide
				</button>
				<recharts.ResponsiveContainer width={700} height={200}>
					{children}
				</recharts.ResponsiveContainer>
			</>
		),
		AreaChart: (props: ComponentProps<typeof recharts.AreaChart>) => (
			<div data-testid="plotted-history" data-points={props.data?.length}>
				<recharts.AreaChart {...props} />
			</div>
		),
	};
});

const snapshots = [
	{
		date: '2026-05-10',
		balance: 1000,
		assetsBalance: 1500,
		liabilitiesBalance: -500,
	},
	{
		date: '2026-11-10',
		balance: 1250,
		assetsBalance: 1750,
		liabilitiesBalance: -500,
	},
];

function response(data: unknown) {
	return {
		data,
		status: 200,
		statusText: 'OK',
		headers: {},
		config: { headers: new AxiosHeaders() },
	};
}

describe('NetWorthHistory', () => {
	const clients: QueryClient[] = [];

	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date(2026, 10, 10, 12));
		vi.mocked(servicesClient.get).mockResolvedValue(
			response({ snapshots })
		);
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		clients.forEach((client) => client.clear());
		clients.length = 0;
		vi.useRealTimers();
		vi.restoreAllMocks();
		vi.resetAllMocks();
	});

	function renderHistory(
		element = <NetWorthHistory currentNetWorth={1250} />
	) {
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		clients.push(client);
		return render(
			<QueryClientProvider client={client}>{element}</QueryClientProvider>
		);
	}

	it('defaults to six months and renders values, change, and the chart', async () => {
		renderHistory();
		expect(
			screen.getByRole('combobox', { name: 'Time range' })
		).toHaveValue('6m');
		await screen.findByTestId('plotted-history');
		expect(screen.getByLabelText('Current net worth')).toHaveTextContent(
			'$1,250.00'
		);
		expect(
			screen.queryByRole('heading', { name: 'Net Worth' })
		).not.toBeInTheDocument();
		expect(screen.getByText(/\+\$250.00 \(\+25%\)/)).toBeInTheDocument();
		expect(
			screen
				.getByLabelText('Net worth history chart')
				.querySelector('svg')
		).not.toBeNull();
		expect(servicesClient.get).toHaveBeenCalledWith(
			'/money/net-worth-history/',
			expect.objectContaining({
				params: { start_date: '2026-05-10', end_date: '2026-11-10' },
			})
		);
	});

	it('fetches every range and reuses fresh cached results when switching back', async () => {
		renderHistory();
		await screen.findByTestId('plotted-history');
		for (const { value } of netWorthPeriods) {
			fireEvent.change(screen.getByRole('combobox'), {
				target: { value },
			});
			await screen.findByTestId('plotted-history');
		}
		expect(servicesClient.get).toHaveBeenCalledTimes(6);
		expect(servicesClient.get).toHaveBeenLastCalledWith(
			'/money/net-worth-history/',
			expect.objectContaining({
				params: { start_date: undefined, end_date: '2026-11-10' },
			})
		);
		fireEvent.change(screen.getByRole('combobox'), {
			target: { value: '6m' },
		});
		await screen.findByTestId('plotted-history');
		expect(servicesClient.get).toHaveBeenCalledTimes(6);
	});

	it('shows a loading state until history arrives', () => {
		vi.mocked(servicesClient.get).mockReturnValue(new Promise(() => {}));
		renderHistory();
		expect(
			screen.getByRole('status', { name: 'Loading net worth history' })
		).toBeInTheDocument();
	});

	it('changes display density on resize while preserving the raw summary and cached data', async () => {
		const daily = Array.from({ length: 185 }, (_, index) => ({
			...snapshots[0],
			date: new Date(Date.UTC(2026, 4, 10 + index))
				.toISOString()
				.slice(0, 10),
			balance: 1000 + index,
			assetsBalance: 1500 + index,
		}));
		vi.mocked(servicesClient.get).mockResolvedValue(
			response({ snapshots: daily })
		);
		renderHistory(<NetWorthHistory currentNetWorth={1184} />);
		await screen.findByTestId('plotted-history');
		expect(screen.getByTestId('plotted-history')).toHaveAttribute(
			'data-points',
			'185'
		);
		expect(screen.getByLabelText('Chart resolution')).toHaveTextContent(
			'Daily snapshots'
		);
		fireEvent.click(screen.getByRole('button', { name: 'Resize narrow' }));
		expect(
			Number(screen.getByTestId('plotted-history').dataset.points)
		).toBeLessThanOrEqual(80);
		expect(screen.getByLabelText('Chart resolution')).toHaveTextContent(
			'Every 3 days'
		);
		expect(screen.getByText('$1,184.00')).toBeInTheDocument();
		expect(screen.getByText(/\+\$184.00 \(\+18.4%\)/)).toBeInTheDocument();
		fireEvent.click(screen.getByRole('button', { name: 'Resize wide' }));
		expect(screen.getByTestId('plotted-history')).toHaveAttribute(
			'data-points',
			'185'
		);
		expect(screen.getByLabelText('Chart resolution')).toHaveTextContent(
			'Daily snapshots'
		);
		expect(servicesClient.get).toHaveBeenCalledTimes(1);
	});

	it('handles empty history', async () => {
		vi.mocked(servicesClient.get).mockResolvedValue(
			response({ snapshots: [] })
		);
		renderHistory();
		expect(
			await screen.findByText(
				'No net-worth history available for this period.'
			)
		).toBeInTheDocument();
	});

	it('renders a single nonpositive snapshot without a percentage', async () => {
		vi.mocked(servicesClient.get).mockResolvedValue(
			response({ snapshots: [{ ...snapshots[0], balance: -100 }] })
		);
		renderHistory(<NetWorthHistory currentNetWorth={-100} />);
		await screen.findByTestId('plotted-history');
		expect(screen.getByText('-$100.00')).toBeInTheDocument();
		expect(
			screen.getByText('Only one snapshot available')
		).toBeInTheDocument();
		expect(screen.queryByText(/%/)).not.toBeInTheDocument();
	});

	it('rejects malformed history and can retry', async () => {
		vi.mocked(servicesClient.get).mockResolvedValueOnce(
			response({ snapshots: null })
		);
		renderHistory();
		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Net worth history unavailable'
		);
		fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
		expect(
			await screen.findByTestId('plotted-history')
		).toBeInTheDocument();
	});

	it('keeps the table-derived net worth visible while a different range loads', async () => {
		let historyRequests = 0;
		vi.mocked(servicesClient.get).mockImplementation(async (url) => {
			if (url === '/money/accounts/') {
				return response({
					data: {
						accountTypeSummaries: [
							{
								type: {
									name: 'cash',
									display: 'Cash',
									group: 'asset',
								},
								accounts: [],
								totalDisplayBalance: 2000,
							},
							{
								type: {
									name: 'credit',
									display: 'Credit',
									group: 'liability',
								},
								accounts: [],
								totalDisplayBalance: 500,
							},
						],
					},
				});
			}
			if (url === '/money/portfolio/') {
				return response({ totalValue: 1000, oneDayChangeDollars: 10 });
			}
			historyRequests++;
			return historyRequests === 1
				? response({ snapshots })
				: new Promise(() => {});
		});
		renderHistory(<NetWorthSummaryCard />);
		const history = within(
			screen.getByRole('region', { name: 'Net worth history' })
		);
		await history.findByTestId('plotted-history');
		const current = history.getByLabelText('Current net worth');
		expect(current).toHaveTextContent('$1,500.00');
		expect(
			within(screen.getByRole('table')).getByText('$1,500.00')
		).toBeInTheDocument();
		fireEvent.change(history.getByRole('combobox'), {
			target: { value: '1m' },
		});
		expect(
			await history.findByRole('status', {
				name: 'Loading net worth history',
			})
		).toBeInTheDocument();
		expect(history.getByLabelText('Current net worth')).toBe(current);
		expect(current).toHaveTextContent('$1,500.00');
		expect(historyRequests).toBe(2);
	});

	it('keeps the table visible when history needs session renewal', async () => {
		const detail = 'Monarch authentication needs renewal.';
		const error = new AxiosError(
			'Request failed',
			'ERR_BAD_RESPONSE',
			undefined,
			undefined,
			{
				...response({ detail }),
				status: 503,
			}
		);
		vi.mocked(servicesClient.get).mockImplementation(async (url) => {
			if (url === '/money/net-worth-history/') throw error;
			return response(
				url === '/money/accounts/'
					? { data: { accountTypeSummaries: [] } }
					: { totalValue: 1000, oneDayChangeDollars: 10 }
			);
		});
		renderHistory(<NetWorthSummaryCard />);
		expect(await screen.findByText(detail)).toBeInTheDocument();
		await waitFor(() =>
			expect(screen.getByRole('table')).toBeInTheDocument()
		);
		expect(
			within(screen.getByRole('table')).getByText('Assets')
		).toBeInTheDocument();
		expect(
			screen.queryByText('Monarch Money unavailable')
		).not.toBeInTheDocument();
	});
});
