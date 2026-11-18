import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { AxiosHeaders } from 'axios';
import type { ReactNode } from 'react';
import { servicesClient } from '@/services/api/clients';
import { createAppRouter } from '@/router';
import { useGuestMode } from '@/hooks/useGuestMode';
import NetWorthSummaryCard from '@/components/money/NetWorthSummary';

vi.mock('@/services/api/clients', () => ({
	servicesClient: { get: vi.fn() },
}));

// Exercise the real URL state and money components without unrelated dashboard APIs.
vi.mock('@/pages/Index', () => ({
	default: function GuestModePage() {
		const { isGuest, toggleGuestMode } = useGuestMode();
		return (
			<NetWorthSummaryCard
				isPrivate={isGuest}
				onTogglePrivacy={() => void toggleGuestMode()}
			/>
		);
	},
}));

// jsdom has no layout engine; leave the chart itself real.
vi.mock('recharts', async (importOriginal) => {
	const recharts = await importOriginal<typeof import('recharts')>();
	return {
		...recharts,
		ResponsiveContainer: ({ children }: { children: ReactNode }) => (
			<recharts.ResponsiveContainer width={700} height={200}>
				{children}
			</recharts.ResponsiveContainer>
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

const accountTypes = [
	['real_estate', 'Real Estate', 'asset', 10000],
	['mortgage', 'Mortgage', 'liability', 5000],
	['investment', 'Investments', 'asset', 3000],
	['loan', 'Loans', 'liability', 400],
	['cash', 'Cash', 'asset', 2000],
	['credit_card', 'Credit Cards', 'liability', 500],
	['vehicle', 'Vehicles', 'asset', 800],
	['other', 'Other Liabilities', 'liability', 100],
] as const;

describe('guest-mode URL and Monarch privacy', () => {
	const clients: QueryClient[] = [];
	const histories: ReturnType<typeof createMemoryHistory>[] = [];

	beforeEach(() => {
		vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
		vi.mocked(servicesClient.get).mockImplementation(async (url) => ({
			data:
				url === '/money/accounts/'
					? {
							data: {
								accountTypeSummaries: accountTypes.map(
									([
										name,
										display,
										group,
										totalDisplayBalance,
									]) => ({
										type: { name, display, group },
										accounts: [],
										totalDisplayBalance,
									})
								),
							},
						}
					: url === '/money/portfolio/'
						? { totalValue: 3000, oneDayChangeDollars: 10 }
						: { snapshots },
			status: 200,
			statusText: 'OK',
			headers: {},
			config: { headers: new AxiosHeaders() },
		}));
	});

	afterEach(() => {
		clients.forEach((client) => client.clear());
		histories.forEach((history) => history.destroy());
		clients.length = 0;
		histories.length = 0;
		vi.clearAllMocks();
		vi.restoreAllMocks();
	});

	async function renderPage(url: string) {
		const history = createMemoryHistory({ initialEntries: [url] });
		const router = createAppRouter(history);
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		clients.push(client);
		histories.push(history);
		await router.load();
		render(
			<QueryClientProvider client={client}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		);
		await waitFor(() =>
			expect(
				screen
					.getByLabelText('Net worth history chart')
					.querySelector('.recharts-area-curve')
			).not.toBeNull()
		);
		await screen.findByRole('table', { hidden: true });
		return { router, history };
	}

	function expectAmountsHidden() {
		const values = [
			...within(
				screen.getByRole('region', { name: 'Net worth history' })
			).getAllByText(/[$%]/),
			...within(screen.getByRole('table', { hidden: true })).getAllByText(
				/[$%]/
			),
		];
		expect(values.length).toBeGreaterThan(10);
		for (const value of values) {
			expect(value.closest('[aria-hidden="true"]')).not.toBeNull();
		}
		expect(screen.getAllByText('Amount hidden').length).toBe(
			values.filter((value) => !value.closest('svg')).length
		);
	}

	it('starts hidden from the URL and keeps the chart, dates, and table available', async () => {
		await renderPage('/?guest=true');
		expect(
			screen.getByRole('button', { name: 'Money privacy mode' })
		).toHaveAttribute('aria-pressed', 'true');
		fireEvent.click(screen.getByText('Account details'));
		expect(screen.getByRole('table')).toBeVisible();
		expectAmountsHidden();
		const chart = screen.getByLabelText('Net worth history chart');
		const yLabels = chart.querySelectorAll(
			'.recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value'
		);
		expect(yLabels.length).toBeGreaterThan(0);
		for (const label of yLabels) {
			expect(label).toHaveAttribute('visibility', 'hidden');
			expect(label).toHaveAttribute('aria-hidden', 'true');
		}
		expect(
			chart.querySelectorAll(
				'.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value'
			).length
		).toBeGreaterThan(0);
		expect(
			chart.querySelectorAll('.recharts-cartesian-grid-horizontal line')
				.length
		).toBeGreaterThan(0);
		expect(chart.querySelector('.recharts-tooltip-wrapper')).toBeNull();
		expect(screen.getByLabelText('Chart resolution')).toBeVisible();
		for (const label of [
			'Assets',
			'Liabilities',
			'Net Worth',
			'Equity',
			'Portfolio',
			'Liquid Funds',
			'Vehicles',
			'Other Liabilities',
		]) {
			expect(
				within(screen.getByRole('table')).getByText(label)
			).toBeVisible();
		}
	});

	it.each(['/', '/?guest=false', '/?guest=invalid'])(
		'shows amounts normally for %s',
		async (url) => {
			await renderPage(url);
			expect(
				screen.getByRole('button', { name: 'Money privacy mode' })
			).toHaveAttribute('aria-pressed', 'false');
			expect(
				within(screen.getByLabelText('Current net worth')).getByText(
					'$9,800.00'
				)
			).not.toHaveAttribute('aria-hidden');
			expect(screen.queryByText('Amount hidden')).not.toBeInTheDocument();
			expect(
				screen
					.getByLabelText('Net worth history chart')
					.querySelectorAll(
						'.recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value'
					).length
			).toBeGreaterThan(0);
		}
	);

	it('synchronizes toggles while preserving the hash, other params, chart range, table state, and cached data', async () => {
		const { history } = await renderPage(
			'/?guest=false&device=kiosk#money'
		);
		fireEvent.click(screen.getByText('Account details'));
		fireEvent.change(screen.getByRole('combobox'), {
			target: { value: '1m' },
		});
		await waitFor(() =>
			expect(
				screen
					.getByLabelText('Net worth history chart')
					.querySelector('svg')
			).not.toBeNull()
		);
		const table = screen.getByRole('table');
		const chart = screen
			.getByLabelText('Net worth history chart')
			.querySelector('svg');
		const requestCount = vi.mocked(servicesClient.get).mock.calls.length;
		const historyLength = history.length;
		const user = userEvent.setup();
		const toggle = screen.getByRole('button', {
			name: 'Money privacy mode',
		});
		toggle.focus();
		await user.keyboard('{Enter}');
		await waitFor(() =>
			expect(toggle).toHaveAttribute('aria-pressed', 'true')
		);
		expectAmountsHidden();
		const hiddenUrl = new URL(history.location.href, 'http://localhost');
		expect(hiddenUrl.searchParams.get('guest')).toBe('true');
		expect(hiddenUrl.searchParams.get('device')).toBe('kiosk');
		expect(hiddenUrl.hash).toBe('#money');
		expect(history.length).toBe(historyLength);
		expect(screen.getByRole('combobox')).toHaveValue('1m');
		expect(screen.getByRole('table')).toBe(table);
		expect(table).toBeVisible();
		expect(
			screen
				.getByLabelText('Net worth history chart')
				.querySelector('svg')
		).toBe(chart);
		expect(
			chart?.parentElement?.querySelector('.recharts-tooltip-wrapper')
		).toBeNull();
		await user.click(toggle);
		await waitFor(() =>
			expect(toggle).toHaveAttribute('aria-pressed', 'false')
		);
		expect(
			new URL(history.location.href, 'http://localhost').searchParams.get(
				'guest'
			)
		).toBe('false');
		expect(screen.queryByText('Amount hidden')).not.toBeInTheDocument();
		expect(servicesClient.get).toHaveBeenCalledTimes(requestCount);
	});

	it('reflects URL navigation and Back/Forward without resetting the disclosure', async () => {
		const { router, history } = await renderPage('/?guest=true');
		fireEvent.click(screen.getByText('Account details'));
		const toggle = screen.getByRole('button', {
			name: 'Money privacy mode',
		});
		await act(async () => {
			await router.navigate({ to: '/', search: { guest: false } });
		});
		expect(toggle).toHaveAttribute('aria-pressed', 'false');
		await act(async () => {
			history.back();
		});
		await waitFor(() =>
			expect(toggle).toHaveAttribute('aria-pressed', 'true')
		);
		await act(async () => {
			history.forward();
		});
		await waitFor(() =>
			expect(toggle).toHaveAttribute('aria-pressed', 'false')
		);
		expect(screen.getByRole('table')).toBeVisible();
	});
});
