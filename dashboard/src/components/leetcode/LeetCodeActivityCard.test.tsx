import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { servicesClient } from '@/services/api/clients';
import LeetCodeActivityCard from './LeetCodeActivityCard';

vi.mock('@/services/api/clients', () => ({
	servicesClient: { get: vi.fn(), post: vi.fn() },
}));

const calendar = {
	username: 'testuser',
	window_start: '2026-11-09',
	window_end: '2026-11-14',
	timezone: 'America/Boise',
	updated_at: '2026-11-14T12:00:00Z',
	sync_status: 'partial',
	message: 'Fetching accepted history and problem difficulties.',
	days: [
		{
			date: '2026-11-09',
			solved_count: 1,
			by_difficulty: { easy: 1, medium: 0, hard: 0 },
			hardest_difficulty: 'easy',
			coverage: 'complete',
		},
		{
			date: '2026-11-10',
			solved_count: 2,
			by_difficulty: { easy: 1, medium: 1, hard: 0 },
			hardest_difficulty: 'medium',
			coverage: 'complete',
		},
		{
			date: '2026-11-11',
			solved_count: 3,
			by_difficulty: { easy: 1, medium: 1, hard: 1 },
			hardest_difficulty: 'hard',
			coverage: 'complete',
		},
		{
			date: '2026-11-12',
			solved_count: 0,
			by_difficulty: { easy: 0, medium: 0, hard: 0 },
			hardest_difficulty: null,
			coverage: 'complete',
		},
		{
			date: '2026-11-13',
			solved_count: 1,
			by_difficulty: { easy: 1, medium: 0, hard: 0 },
			hardest_difficulty: null,
			coverage: 'partial',
		},
		{
			date: '2026-11-14',
			solved_count: 0,
			by_difficulty: { easy: 0, medium: 0, hard: 0 },
			hardest_difficulty: null,
			coverage: 'unknown',
		},
	],
};
const response = (data: unknown) => ({
	data,
	status: 200,
	statusText: 'OK',
	headers: {},
	config: { headers: new AxiosHeaders() },
});

const solved = {
	all: {
		solved: 400,
		total: 3000,
		solved_percent: 13.33,
		beats_percent: null,
	},
	easy: { solved: 150, total: 1000, solved_percent: 15, beats_percent: 90 },
	medium: {
		solved: 200,
		total: 1500,
		solved_percent: 13.33,
		beats_percent: 80,
	},
	hard: { solved: 50, total: 500, solved_percent: 10, beats_percent: 70 },
};
function requestData(url: string, data = calendar) {
	return response(
		url === '/leetcode/solved/'
			? solved
			: url === '/leetcode/languages/'
				? {
						languages: [
							{ languageName: 'Python3', problemsSolved: 350 },
						],
					}
				: data
	);
}

describe('LeetCode difficulty calendar', () => {
	const clients: QueryClient[] = [];
	beforeEach(() => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.mocked(servicesClient.get).mockImplementation(async (url) =>
			requestData(url)
		);
		vi.mocked(servicesClient.post).mockResolvedValue(
			response({ status: 'scheduled' })
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
		render(
			<QueryClientProvider client={client}>
				<LeetCodeActivityCard />
			</QueryClientProvider>
		);
	}

	it('colors completed days by the highest difficulty and distinguishes incomplete data from zero solves', async () => {
		renderCard();
		const grid = await screen.findByRole('grid', {
			name: 'LeetCode activity calendar',
		});
		const square = (date: string) =>
			grid.querySelector(`button[data-date="${date}"]`)!;
		expect(grid.querySelectorAll('button[data-date]')).toHaveLength(366);
		expect(
			screen.getByLabelText('All-time LeetCode problems solved')
		).toHaveTextContent('400');
		expect(screen.getAllByRole('progressbar')).toHaveLength(3);
		expect(
			screen.getByRole('progressbar', { name: 'Easy problems solved' })
		).toHaveAttribute('aria-valuetext', '150 of 1000 problems solved');
		expect(screen.queryByText(/Beats/)).not.toBeInTheDocument();
		expect(
			screen.getByRole('list', { name: 'Languages used on LeetCode' })
		).toHaveTextContent('Python3');
		expect(square('2026-11-09')).toHaveStyle({
			backgroundColor: '#34d399',
		});
		expect(square('2026-11-10')).toHaveStyle({
			backgroundColor: '#f59e0b',
		});
		expect(square('2026-11-11')).toHaveStyle({
			backgroundColor: '#ef4444',
		});
		expect(square('2026-11-12').getAttribute('style')).not.toContain(
			'gradient'
		);
		expect(square('2026-11-13').getAttribute('style')).toContain(
			'gradient'
		);
		expect(square('2026-11-14')).toHaveAttribute(
			'aria-label',
			'November 14, 2026: history not yet known'
		);
		expect(
			screen.getByText('7 daily problem solves observed')
		).toBeVisible();
		expect(screen.getByText(/America\/Boise/)).toBeVisible();
		const user = userEvent.setup();
		await user.hover(square('2026-11-11'));
		expect(await screen.findByRole('tooltip')).toHaveTextContent(
			'Easy 1, Medium 1, Hard 1'
		);
	});

	it('requests a sync and refreshes the status without replacing the chart', async () => {
		renderCard();
		const grid = await screen.findByRole('grid');
		await userEvent
			.setup()
			.click(screen.getByRole('button', { name: 'Sync now' }));
		await waitFor(() =>
			expect(servicesClient.post).toHaveBeenCalledWith(
				'/leetcode/calendar/sync/',
				{},
				undefined
			)
		);
		await waitFor(() =>
			expect(
				vi
					.mocked(servicesClient.get)
					.mock.calls.filter(([url]) => url === '/leetcode/calendar/')
			).toHaveLength(2)
		);
		expect(screen.getByRole('grid')).toBe(grid);
	});

	it('shows a clear setup error and can retry after configuration', async () => {
		const detail =
			'Set LEETCODE_SESSION and LEETCODE_CSRF_TOKEN on the API to enable difficulty history.';
		let unavailable = true;
		vi.mocked(servicesClient.get).mockImplementation(async (url) => {
			if (url === '/leetcode/calendar/' && unavailable) {
				unavailable = false;
				throw new AxiosError(
					'Unavailable',
					undefined,
					undefined,
					undefined,
					{
						...response({ detail }),
						status: 503,
					}
				);
			}
			return requestData(url);
		});
		renderCard();
		expect(await screen.findByRole('alert')).toHaveTextContent(detail);
		await userEvent
			.setup()
			.click(screen.getByRole('button', { name: 'Try again' }));
		expect(await screen.findByRole('grid')).toBeVisible();
	});

	it('keeps the chart visible when synchronization fails and marks pending work', async () => {
		vi.mocked(servicesClient.get).mockImplementation(async (url) =>
			requestData(url, {
				...calendar,
				sync_status: 'error',
				message:
					'The LeetCode session account does not match LEETCODE_USERNAME.',
			})
		);
		renderCard();
		expect(await screen.findByRole('grid')).toBeVisible();
		expect(screen.getByRole('alert')).toHaveTextContent('does not match');
	});
});
