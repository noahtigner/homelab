import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosHeaders } from 'axios';
import type { ComponentProps, ReactNode } from 'react';
import { servicesClient } from '@/services/api/clients';
import PiholeStatus from './PiholeStatus';

vi.mock('@/services/api/clients', () => ({ servicesClient: { get: vi.fn() } }));

vi.mock('recharts', async (importOriginal) => {
	const recharts = await importOriginal<typeof import('recharts')>();
	return {
		...recharts,
		ResponsiveContainer: ({ children }: { children: ReactNode }) => (
			<recharts.ResponsiveContainer width={700} height={90}>
				{children}
			</recharts.ResponsiveContainer>
		),
		AreaChart: (props: ComponentProps<typeof recharts.AreaChart>) => (
			<div
				data-testid="dns-history-points"
				data-points={JSON.stringify(props.data)}
			>
				<recharts.AreaChart {...props} />
			</div>
		),
	};
});

const summary = {
	sum_queries: 15340,
	sum_blocked: 1234,
	percent_blocked: 8.04,
	total_clients: 12,
	gravity: 250000,
	qps: 2.5,
	uptime: 86400,
	percent_mem: 1.5,
	percent_cpu: 0.1,
};
const history = {
	window_start: 1800000000,
	window_end: 1800086400,
	interval_seconds: 600,
	history: [
		{ timestamp: 1800000000, total: 100, blocked: 20 },
		{ timestamp: 1800000600, total: 0, blocked: 0 },
		{ timestamp: 1800002400, total: 50, blocked: 5 },
	],
};

function response(data: unknown) {
	return {
		data,
		status: 200,
		statusText: 'OK',
		headers: {},
		config: { headers: new AxiosHeaders() },
	};
}

describe('Pi-hole DNS ad blocking', () => {
	const clients: QueryClient[] = [];

	beforeEach(() => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.mocked(servicesClient.get).mockImplementation(async (url) =>
			response(url === '/pihole/summary/' ? summary : history)
		);
	});

	afterEach(() => {
		clients.forEach((client) => client.clear());
		clients.length = 0;
		vi.restoreAllMocks();
		vi.resetAllMocks();
	});

	function renderCard() {
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		clients.push(client);
		return render(
			<QueryClientProvider client={client}>
				<PiholeStatus />
			</QueryClientProvider>
		);
	}

	it('renders a single card with the renamed title and metrics', async () => {
		const { container } = renderCard();
		await screen.findByRole('img');
		expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(
			1
		);
		expect(
			screen.getByRole('heading', { name: 'Pi-hole DNS Ad Blocking' })
		).toBeInTheDocument();
		expect(screen.getByLabelText('DNS queries total')).toHaveTextContent(
			'15,340'
		);
		expect(screen.getByLabelText('Blocked total')).toHaveTextContent(
			'1,234'
		);
		expect(screen.getByText('2.5/s')).toBeInTheDocument();
		expect(screen.getByText('8.04%')).toBeInTheDocument();
		expect(
			screen.getByText('250,000 blocked domains · 12 clients')
		).toBeInTheDocument();
		expect(screen.getAllByRole('img')).toHaveLength(1);
		expect(container.querySelector('.lucide')).toBeNull();
		for (const endpoint of ['/pihole/summary/', '/pihole/history/']) {
			expect(
				vi
					.mocked(servicesClient.get)
					.mock.calls.filter(([url]) => url === endpoint)
			).toHaveLength(1);
		}
	});

	it('draws both filled series on one scale with blocked rendered above total', async () => {
		renderCard();
		const chart = await screen.findByRole('img');
		const data = screen.getByTestId('dns-history-points').dataset.points;
		expect(JSON.parse(data!)).toEqual(history.history);
		const fills = chart.querySelectorAll('.recharts-area-area');
		const curves = chart.querySelectorAll('.recharts-area-curve');
		expect(fills).toHaveLength(2);
		expect(curves).toHaveLength(2);
		expect(fills[0]).toHaveAttribute('fill', 'var(--primary)');
		expect(fills[1]).toHaveAttribute('fill', 'var(--warning-foreground)');
		expect(curves[0]).toHaveAttribute('stroke', 'var(--primary)');
		expect(curves[1]).toHaveAttribute(
			'stroke',
			'var(--warning-foreground)'
		);
		for (const curve of curves) {
			expect(curve.getAttribute('d')?.match(/M/g)).toHaveLength(1);
		}
		expect(chart.querySelectorAll('.recharts-yAxis')).toHaveLength(1);
		expect(screen.getByText('0')).toBeInTheDocument();
	});

	it('keeps one card and reserves the chart space while loading', () => {
		vi.mocked(servicesClient.get).mockReturnValue(new Promise(() => {}));
		const { container } = renderCard();
		expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(
			1
		);
		expect(
			screen.getByRole('status', {
				name: 'Loading DNS ad blocking history',
			})
		).toBeInTheDocument();
		expect(container.querySelector('svg')).toBeNull();
	});

	it('keeps summary values visible while history loads', async () => {
		vi.mocked(servicesClient.get).mockImplementation((url) =>
			url === '/pihole/history/'
				? new Promise(() => {})
				: Promise.resolve(response(summary))
		);
		renderCard();
		expect(await screen.findByText('15,340')).toBeInTheDocument();
		expect(screen.getByRole('status')).toBeInTheDocument();
		expect(
			screen.getByText('250,000 blocked domains · 12 clients')
		).toBeInTheDocument();
	});

	it('keeps metrics visible when only history fails', async () => {
		vi.mocked(servicesClient.get).mockImplementation(async (url) => {
			if (url === '/pihole/history/')
				throw new Error('History unavailable');
			return response(summary);
		});
		renderCard();
		expect(
			await screen.findByText('History unavailable')
		).toBeInTheDocument();
		expect(screen.getByText('15,340')).toBeInTheDocument();
		expect(screen.getByText('1,234')).toBeInTheDocument();
	});

	it('shows a compact summary error when both requests fail', async () => {
		vi.mocked(servicesClient.get).mockRejectedValue(new Error('Offline'));
		renderCard();
		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Summary unavailable'
		);
		expect(screen.getByText('History unavailable')).toBeInTheDocument();
		expect(screen.queryByRole('img')).not.toBeInTheDocument();
	});

	it('handles empty history without hiding the summary', async () => {
		vi.mocked(servicesClient.get).mockImplementation(async (url) =>
			response(
				url === '/pihole/summary/'
					? summary
					: { ...history, history: [] }
			)
		);
		renderCard();
		expect(
			await screen.findByText('No recent query history')
		).toBeInTheDocument();
		expect(screen.getByText('15,340')).toBeInTheDocument();
	});

	it('can display history when the summary is unavailable', async () => {
		vi.mocked(servicesClient.get).mockImplementation(async (url) => {
			if (url === '/pihole/summary/')
				throw new Error('Summary unavailable');
			return response(history);
		});
		renderCard();
		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Summary unavailable'
		);
		expect(screen.getByRole('img')).toBeInTheDocument();
		expect(screen.getByText('DNS queries')).toBeInTheDocument();
		expect(screen.getByText('Blocked')).toBeInTheDocument();
	});

	it('draws genuine zero traffic as data', async () => {
		vi.mocked(servicesClient.get).mockImplementation(async (url) =>
			response(
				url === '/pihole/summary/'
					? {
							...summary,
							sum_queries: 0,
							sum_blocked: 0,
							percent_blocked: 0,
						}
					: {
							...history,
							history: history.history.map((point) => ({
								...point,
								total: 0,
								blocked: 0,
							})),
						}
			)
		);
		renderCard();
		await screen.findByRole('img');
		expect(screen.getByLabelText('DNS queries total')).toHaveTextContent(
			'0'
		);
		expect(screen.getByLabelText('Blocked total')).toHaveTextContent('0');
		expect(screen.getByText('0.00%')).toBeInTheDocument();
		expect(
			screen.queryByText('No recent query history')
		).not.toBeInTheDocument();
	});
});
