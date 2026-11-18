import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { servicesClient } from '@/services/api/clients';
import {
	describeContributionDay,
	getContributionMonths,
	type ContributionCalendar as CalendarData,
} from '@/lib/githubContributions';
import ContributionCalendar from './ContributionCalendar';
import GithubSummaryCard from './GithubSummaryCard';

vi.mock('@/services/api/clients', () => ({ servicesClient: { get: vi.fn() } }));

const levels = [
	'NONE',
	'FIRST_QUARTILE',
	'SECOND_QUARTILE',
	'THIRD_QUARTILE',
	'FOURTH_QUARTILE',
] as const;
const dates = [
	'2024-02-26',
	'2024-02-27',
	'2024-02-28',
	'2024-02-29',
	'2024-03-01',
	'2024-03-02',
	'2024-03-03',
	'2024-03-04',
	'2024-03-05',
];
const calendar: CalendarData = {
	username: 'testuser',
	window_start: '2023-03-05',
	window_end: '2024-03-05',
	total_contributions: 16,
	weeks: [
		{
			first_day: '2024-02-25',
			days: dates.slice(0, 6).map((date, index) => ({
				date,
				weekday: index + 1,
				contribution_count: index % 5,
				contribution_level: levels[index % 5],
			})),
		},
		{
			first_day: '2024-03-03',
			days: dates.slice(6).map((date, index) => ({
				date,
				weekday: index,
				contribution_count: index + 1,
				contribution_level: levels[index + 1],
			})),
		},
	],
};
const events = {
	events: [],
	events_seen: {},
	repos_seen: [
		{
			id: 1,
			name: 'testuser/homelab',
			url: 'https://github.com/testuser/homelab',
		},
	],
	contributions: { own_projects: 12, oss_projects: 3 },
};

const response = (data: unknown) => ({
	data,
	status: 200,
	statusText: 'OK',
	headers: {},
	config: { headers: new AxiosHeaders() },
});

describe('GitHub contribution calendar', () => {
	it('renders partial weeks in Sunday–Saturday rows, with dates and a single keyboard entry point', () => {
		render(<ContributionCalendar calendar={calendar} />);
		expect(
			screen.getByRole('heading', {
				name: '16 contributions in the last 366 days',
			})
		).toBeVisible();
		const grid = screen.getByRole('grid', {
			name: 'GitHub contribution calendar',
		});
		expect(grid.querySelectorAll('tbody tr')).toHaveLength(7);
		expect(
			grid.querySelectorAll('tbody tr')[0].querySelectorAll('button')
		).toHaveLength(52);
		expect(
			grid.querySelector('button[data-date="2024-02-29"]')?.closest('tr')
		).toBe(grid.querySelectorAll('tbody tr')[4]);
		expect(grid.querySelectorAll('button[data-date]')).toHaveLength(366);
		expect(grid.querySelectorAll('button[tabindex="0"]')).toHaveLength(1);
		expect(
			within(grid).getByLabelText('3 contributions on March 5, 2024')
		).toHaveAttribute('tabindex', '0');
		expect(
			within(grid).getByLabelText('0 contributions on February 26, 2024')
		).toHaveStyle({ backgroundColor: 'var(--muted)' });
		expect(screen.getByText('Less')).toBeVisible();
		expect(screen.getByText('More')).toBeVisible();
	});

	it('moves by day/week and supports Home/End while updating details and focus tooltips', async () => {
		const user = userEvent.setup();
		render(<ContributionCalendar calendar={calendar} />);
		await user.tab();
		expect(document.activeElement).toHaveAttribute(
			'data-date',
			'2024-03-05'
		);
		await user.keyboard('{ArrowLeft}');
		expect(document.activeElement).toHaveAttribute(
			'data-date',
			'2024-02-27'
		);
		await user.keyboard('{ArrowDown}{ArrowDown}');
		expect(document.activeElement).toHaveAttribute(
			'data-date',
			'2024-02-29'
		);
		expect(await screen.findByRole('tooltip')).toHaveTextContent(
			'3 contributions on February 29, 2024'
		);
		await user.keyboard('{Home}');
		expect(document.activeElement).toHaveAttribute(
			'data-date',
			'2023-03-06'
		);
		await user.keyboard('{End}');
		expect(document.activeElement).toHaveAttribute(
			'data-date',
			'2024-03-05'
		);
		await user.keyboard('{Tab}');
		expect(document.activeElement).toBe(document.body);
	});

	it('provides hover details and renders a zero-activity year normally', async () => {
		const user = userEvent.setup();
		const empty = {
			...calendar,
			total_contributions: 0,
			weeks: calendar.weeks.map((week) => ({
				...week,
				days: week.days.map((day) => ({
					...day,
					contribution_count: 0,
					contribution_level: 'NONE' as const,
				})),
			})),
		};
		render(<ContributionCalendar calendar={empty} />);
		expect(
			screen.getByRole('heading', {
				name: '0 contributions in the last 366 days',
			})
		).toBeVisible();
		await user.hover(
			screen.getByLabelText('0 contributions on February 29, 2024')
		);
		expect(await screen.findByRole('tooltip')).toHaveTextContent(
			'0 contributions on February 29, 2024'
		);
		expect(
			screen.getByRole('grid').querySelectorAll('button[data-date]')
		).toHaveLength(366);
	});

	it('formats leap-day dates in UTC and distinguishes December/January month groups', () => {
		expect(describeContributionDay(calendar.weeks[0].days[3])).toBe(
			'3 contributions on February 29, 2024'
		);
		const week = (date: string, firstDay: string) => ({
			first_day: firstDay,
			days: [{ ...calendar.weeks[0].days[0], date }],
		});
		expect(
			getContributionMonths([
				week('2023-12-24', '2023-12-24'),
				week('2024-01-01', '2023-12-31'),
				week('2024-01-07', '2024-01-07'),
			])
		).toEqual([
			{ key: '2023-12', label: 'Dec', columns: 1 },
			{ key: '2024-01', label: 'Jan', columns: 2 },
		]);
	});
});

describe('GitHub calendar integration', () => {
	const clients: QueryClient[] = [];
	beforeEach(() => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});
	afterEach(() => {
		clients.forEach((client) => client.clear());
		clients.length = 0;
		vi.restoreAllMocks();
		vi.clearAllMocks();
	});
	function renderCard() {
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		clients.push(client);
		render(
			<QueryClientProvider client={client}>
				<GithubSummaryCard />
			</QueryClientProvider>
		);
	}

	it('fetches calendar data separately from recent activity and validates the response', async () => {
		vi.mocked(servicesClient.get).mockImplementation(async (url) =>
			response(url === '/github/contributions/' ? calendar : events)
		);
		renderCard();
		expect(await screen.findByRole('grid')).toBeVisible();
		expect(
			screen.getByRole('link', { name: 'testuser/homelab' })
		).toBeVisible();
		expect(
			screen.getByRole('heading', { name: 'Recent public activity' })
		).toBeVisible();
		expect(servicesClient.get).toHaveBeenCalledWith(
			'/github/contributions/',
			expect.objectContaining({ signal: expect.any(AbortSignal) })
		);
	});

	it('keeps recent activity available while the calendar loads', async () => {
		vi.mocked(servicesClient.get).mockImplementation(async (url) =>
			url === '/github/contributions/'
				? new Promise(() => {})
				: response(events)
		);
		renderCard();
		expect(
			await screen.findByRole('link', { name: 'testuser/homelab' })
		).toBeVisible();
		expect(
			screen.getByRole('status', {
				name: 'Loading GitHub contribution calendar',
			})
		).toBeVisible();
	});

	it('shows token setup instructions without losing recent activity, and can retry', async () => {
		const detail =
			'Set GITHUB_TOKEN on the API to enable the GitHub contribution calendar.';
		let unavailable = true;
		vi.mocked(servicesClient.get).mockImplementation(async (url) => {
			if (url === '/github/events/') return response(events);
			if (unavailable)
				throw new AxiosError(
					'Unavailable',
					'ERR_BAD_RESPONSE',
					undefined,
					undefined,
					{ ...response({ detail }), status: 503 }
				);
			return response(calendar);
		});
		renderCard();
		expect(await screen.findByText(detail)).toBeVisible();
		expect(
			screen.getByRole('link', { name: 'testuser/homelab' })
		).toBeVisible();
		unavailable = false;
		await userEvent
			.setup()
			.click(screen.getByRole('button', { name: 'Try again' }));
		expect(await screen.findByRole('grid')).toBeVisible();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('handles malformed calendar data with the independent error state', async () => {
		vi.mocked(servicesClient.get).mockImplementation(async (url) =>
			response(
				url === '/github/contributions/'
					? { ...calendar, weeks: [] }
					: events
			)
		);
		renderCard();
		await waitFor(() =>
			expect(screen.getByRole('alert')).toHaveTextContent(
				'GitHub contribution calendar unavailable'
			)
		);
		expect(
			screen.getByRole('link', { name: 'testuser/homelab' })
		).toBeVisible();
	});
});
