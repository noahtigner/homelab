import { test, expect } from '@playwright/test';

// Mock data for API responses
const mockDiagnosticsData = {
	cpu: {
		percent: [15.2, 12.8, 18.5, 10.1],
		temp: 45.5,
	},
	memory: {
		percent: 62.3,
	},
	disk: {
		percent: 48.7,
	},
};

const mockNasDiagnosticsData = {
	utilization: {
		cpu: { cpu_1: 12.5, cpu_2: 8.3, cpu_3: 15.2, cpu_4: 10.1 },
		memory: { real_usage: 55.2 },
	},
	storage: {
		vol_info: [
			{ used_size: 4500000000000, total_size: 12000000000000 },
			{ used_size: 2300000000000, total_size: 8000000000000 },
		],
		hdd_info: [
			{
				diskno: 'Disk 1',
				capacity: 4000000000000,
				overview_status: 'normal',
				temp: 35,
				order: 1,
			},
			{
				diskno: 'Disk 2',
				capacity: 4000000000000,
				overview_status: 'normal',
				temp: 36,
				order: 2,
			},
			{
				diskno: 'Disk 3',
				capacity: 4000000000000,
				overview_status: 'normal',
				temp: 34,
				order: 3,
			},
			{
				diskno: 'Disk 4',
				capacity: 4000000000000,
				overview_status: 'normal',
				temp: 37,
				order: 4,
			},
		],
	},
	core: {
		sys_temp: 42,
	},
};

const mockPiholeSummaryData = {
	sum_queries: 125847,
	sum_blocked: 18456,
	percent_blocked: 14.67,
	qps: 1.45,
	gravity: 893456,
	total_clients: 24,
};

const mockServiceHealthData = {
	status: 'ok',
};

const mockLeetCodeSolvedData = {
	all: { solved: 847, total: 3400 },
	easy: { solved: 412, total: 800, beats_percent: 85.3, solved_percent: 51.5 },
	medium: {
		solved: 356,
		total: 1700,
		beats_percent: 72.1,
		solved_percent: 20.9,
	},
	hard: { solved: 79, total: 900, beats_percent: 68.5, solved_percent: 8.8 },
};

const mockLeetCodeLanguagesData = [
	{ languageName: 'Python', problemsSolved: 412 },
	{ languageName: 'JavaScript', problemsSolved: 256 },
	{ languageName: 'TypeScript', problemsSolved: 89 },
	{ languageName: 'Go', problemsSolved: 45 },
	{ languageName: 'Rust', problemsSolved: 45 },
];

const mockNpmPackageData = {
	name: 'validate-env-vars',
	version: '2.0.0',
	description: 'Validate environment variables',
	license: 'MIT',
	homepage: 'https://github.com/noahtigner/validate-env-vars',
	repository: 'https://github.com/noahtigner/validate-env-vars',
	issues: 'https://github.com/noahtigner/validate-env-vars/issues',
	pulls: 'https://github.com/noahtigner/validate-env-vars/pulls',
	downloads: {
		total: 1247,
		per_day: Array.from({ length: 30 }, (_, i) => ({
			downloads: Math.floor(Math.random() * 100) + 20,
			day: `2024-01-${String(i + 1).padStart(2, '0')}`,
		})),
	},
};

const mockGithubEventsData = {
	events: [],
	events_seen: {},
	repos_seen: [
		{
			id: 1,
			name: 'noahtigner/homelab',
			url: 'https://github.com/noahtigner/homelab',
		},
		{
			id: 2,
			name: 'noahtigner/validate-env-vars',
			url: 'https://github.com/noahtigner/validate-env-vars',
		},
		{
			id: 3,
			name: 'noahtigner/noahtigner.github.io',
			url: 'https://github.com/noahtigner/noahtigner.github.io',
		},
		{ id: 4, name: 'facebook/react', url: 'https://github.com/facebook/react' },
	],
	contributions: {
		own_projects: 156,
		oss_projects: 23,
	},
};

const mockInvestmentSummaryData = {
	totalValue: 125847.52,
	oneDayChangeDollars: 847.23,
};

const mockAccountTypeSummariesData = {
	data: {
		accountTypeSummaries: [
			{
				type: { name: 'brokerage', display: 'Brokerage', group: 'asset' },
				totalDisplayBalance: 125847.52,
				accounts: [],
			},
			{
				type: { name: 'savings', display: 'Savings', group: 'asset' },
				totalDisplayBalance: 45623.18,
				accounts: [],
			},
			{
				type: { name: 'checking', display: 'Checking', group: 'asset' },
				totalDisplayBalance: 8234.56,
				accounts: [],
			},
			{
				type: { name: 'real_estate', display: 'Real Estate', group: 'asset' },
				totalDisplayBalance: 485000.0,
				accounts: [],
			},
			{
				type: { name: 'credit_card', display: 'Credit Cards', group: 'liability' },
				totalDisplayBalance: 2456.78,
				accounts: [],
			},
			{
				type: { name: 'loan', display: 'Loans', group: 'liability' },
				totalDisplayBalance: 342567.89,
				accounts: [
					{
						displayName: 'Home Mortgage',
						displayBalance: 342567.89,
						institution: { name: 'Chase Mortgage' },
					},
				],
			},
		],
	},
};

const mockActiveUsersData = {
	per_day: Array.from({ length: 365 }, (_, i) => ({
		active_users: Math.floor(Math.random() * 50) + 10,
		date: `2024-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
	})),
};

const mockOgpPreviewData = {
	hybridGraph: {
		title: 'Noah Tigner - Software Engineer',
		description:
			'Personal portfolio and blog of Noah Tigner, a software engineer specializing in full-stack development.',
		image: 'https://noahtigner.com/og-image.png',
	},
};

const mockPlexLibraryData = {
	sections: [
		{ key: '1', title: 'Movies', type: 'movie', count: 847 },
		{ key: '2', title: 'TV Shows', type: 'show', count: 156 },
		{ key: '3', title: 'Music', type: 'artist', count: 2345 },
	],
};

const mockPlexSessionsData = {
	count: 2,
	sessions: [
		{
			username: 'noahtigner',
			title: 'The Matrix',
			grandparent_title: null,
			media_type: 'movie',
			progress_percent: 45.5,
			view_offset_ms: 3900000,
			duration_ms: 8580000,
			player: {
				title: 'Living Room TV',
				platform: 'Android',
				state: 'playing',
			},
		},
		{
			username: 'guest',
			title: 'Pilot',
			grandparent_title: 'Breaking Bad',
			media_type: 'episode',
			progress_percent: 72.3,
			view_offset_ms: 2170000,
			duration_ms: 3000000,
			player: {
				title: 'iPad',
				platform: 'iOS',
				state: 'paused',
			},
		},
	],
};

test.describe('Dashboard Screenshots', () => {
	test.beforeEach(async ({ page }) => {
		// Mock all API endpoints
		await page.route('**/diagnostics/diagnostics/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockDiagnosticsData),
			});
		});

		await page.route('**/diagnostics/nas/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockNasDiagnosticsData),
			});
		});

		await page.route('**/pihole/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockPiholeSummaryData),
			});
		});

		await page.route('**/diagnostics/', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockServiceHealthData),
			});
		});

		await page.route('**/diagnostics/docker/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockServiceHealthData),
			});
		});

		await page.route('**/cache/', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockServiceHealthData),
			});
		});

		await page.route('**/', async (route) => {
			// Only handle root API endpoint, not navigation
			if (route.request().resourceType() === 'fetch') {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(mockServiceHealthData),
				});
			} else {
				await route.continue();
			}
		});

		await page.route('**/leetcode/**/solved/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockLeetCodeSolvedData),
			});
		});

		await page.route('**/leetcode/**/languages/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockLeetCodeLanguagesData),
			});
		});

		await page.route('**/npm/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockNpmPackageData),
			});
		});

		await page.route('**/github/events/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockGithubEventsData),
			});
		});

		await page.route('**/money/investments/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockInvestmentSummaryData),
			});
		});

		await page.route('**/money/accounts/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockAccountTypeSummariesData),
			});
		});

		await page.route('**/a/active_users/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockActiveUsersData),
			});
		});

		await page.route('**/ogp/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockOgpPreviewData),
			});
		});

		await page.route('**/plex/library/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockPlexLibraryData),
			});
		});

		await page.route('**/plex/sessions/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockPlexSessionsData),
			});
		});
	});

	test('take full dashboard screenshot', async ({ page }) => {
		// Navigate to the local dev server
		await page.goto('http://localhost:5173');

		// Wait for the page to load
		await page.waitForLoadState('networkidle');

		// Wait a bit more for any async data to load
		await page.waitForTimeout(2000);

		// Take a full page screenshot
		await page.screenshot({
			path: 'screenshots/dashboard-full.png',
			fullPage: true,
		});

		// Verify the page loaded correctly
		await expect(page).toHaveTitle(/homelab|Dashboard|React/);
	});

	test('take viewport screenshot', async ({ page }) => {
		await page.goto('http://localhost:5173');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Take a viewport screenshot
		await page.screenshot({
			path: 'screenshots/dashboard-viewport.png',
		});
	});
});
