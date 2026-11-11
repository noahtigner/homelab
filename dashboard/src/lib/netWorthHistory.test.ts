import { describe, expect, it } from 'vitest';
import {
	getNetWorthChange,
	getNetWorthDateRange,
	getNetWorthPointBudget,
	parseHistoryDate,
	sampleNetWorthHistory,
	type NetWorthPeriod,
} from './netWorthHistory';

describe('net-worth calendar ranges', () => {
	it.each<[NetWorthPeriod, string | undefined]>([
		['1m', '2026-10-10'],
		['3m', '2026-08-10'],
		['6m', '2026-05-10'],
		['ytd', '2026-01-01'],
		['1y', '2025-11-10'],
		['all', undefined],
	])('resolves %s using local calendar dates', (period, start) => {
		const range = getNetWorthDateRange(
			period,
			new Date(2026, 10, 10, 23, 30)
		);
		expect(range.end_date).toBe('2026-11-10');
		expect(range.start_date).toBe(start);
	});

	it.each([
		['1m', new Date(2026, 2, 31), '2026-02-28'],
		['1m', new Date(2024, 2, 31), '2024-02-29'],
		['1y', new Date(2024, 1, 29), '2023-02-28'],
		['3m', new Date(2026, 0, 31), '2025-10-31'],
		['ytd', new Date(2027, 0, 1), '2027-01-01'],
	] as const)(
		'clamps %s at month/year boundaries',
		(period, today, start) => {
			expect(getNetWorthDateRange(period, today).start_date).toBe(start);
		}
	);

	it('keeps a date-only snapshot on the same local calendar day', () => {
		const date = parseHistoryDate('2026-11-10');
		expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
			2026, 10, 10,
		]);
	});
});

function dailyHistory(start: string, end: string) {
	const result = [];
	const day = new Date(`${start}T00:00:00Z`);
	while (day.toISOString().slice(0, 10) <= end) {
		result.push({
			date: day.toISOString().slice(0, 10),
			balance: 1000 + result.length,
			assetsBalance: 1500 + result.length,
			liabilitiesBalance: -500,
		});
		day.setUTCDate(day.getUTCDate() + 1);
	}
	return result;
}

describe('net-worth display sampling', () => {
	it('handles empty and single-point history', () => {
		expect(sampleNetWorthHistory([]).snapshots).toEqual([]);
		const single = dailyHistory('2026-11-10', '2026-11-10');
		expect(sampleNetWorthHistory(single).snapshots).toBe(single);
	});

	it.each([
		['2026-05-10', '2026-11-10', 'Daily snapshots'],
		['2026-05-09', '2026-11-10', 'Weekly snapshots'],
		['2024-11-10', '2026-11-10', 'Weekly snapshots'],
		['2024-11-09', '2026-11-10', 'Monthly snapshots'],
		['2024-02-29', '2024-08-31', 'Daily snapshots'],
	])('chooses resolution from %s through %s', (start, end, label) => {
		expect(
			sampleNetWorthHistory(dailyHistory(start, end)).resolutionLabel
		).toBe(label);
	});

	it('preserves short daily history without copying it', () => {
		const history = dailyHistory('2026-10-10', '2026-11-10');
		expect(sampleNetWorthHistory(history).snapshots).toBe(history);
	});

	it('uses the last real monthly balance and keeps exact partial-period endpoints', () => {
		const dates = [
			'2023-01-15',
			'2023-01-31',
			'2023-02-28',
			'2024-02-29',
			'2026-11-01',
			'2026-11-10',
		];
		const history = Object.freeze(
			dates.map((date, index) =>
				Object.freeze({
					date,
					balance: index - 10,
					assetsBalance: index + 100,
					liabilitiesBalance: -110,
				})
			)
		);
		const result = sampleNetWorthHistory(history);
		expect(result.snapshots).toEqual([
			history[0],
			history[1],
			history[2],
			history[3],
			history[5],
		]);
		for (const point of result.snapshots) {
			expect(history).toContain(point);
		}
	});

	it('aligns weekly buckets to Monday across year and DST boundaries', () => {
		const dates = [
			'2025-06-01',
			'2025-11-02',
			'2025-11-03',
			'2025-12-28',
			'2025-12-29',
			'2025-12-31',
			'2026-01-04',
			'2026-01-05',
			'2026-01-06',
		];
		const result = sampleNetWorthHistory(dates.map((date) => ({ date })));
		expect(result.snapshots.map((point) => point.date)).toEqual([
			'2025-06-01',
			'2025-11-02',
			'2025-11-03',
			'2025-12-28',
			'2026-01-04',
			'2026-01-06',
		]);
	});

	it.each([3, 10, 80, 160, 240])(
		'bounds long history to %s points while retaining real endpoints',
		(budget) => {
			const history = dailyHistory('2005-01-15', '2026-11-10');
			const result = sampleNetWorthHistory(history, budget).snapshots;
			expect(result.length).toBeLessThanOrEqual(budget);
			expect(result[0]).toBe(history[0]);
			expect(result[result.length - 1]).toBe(history[history.length - 1]);
			const dates = result.map((point) => point.date);
			expect(dates).toEqual([...new Set(dates)].sort());
		}
	);

	it('reduces six months for mobile while preserving exact daily balances', () => {
		const history = dailyHistory('2026-05-10', '2026-11-10');
		const narrow = sampleNetWorthHistory(history, 80);
		expect(narrow.resolutionLabel).toBe('Every 3 days');
		expect(narrow.snapshots.length).toBeLessThanOrEqual(80);
		expect(narrow.snapshots[0]).toBe(history[0]);
		expect(narrow.snapshots[narrow.snapshots.length - 1]).toBe(
			history[184]
		);
		expect(sampleNetWorthHistory(history, 240).snapshots).toBe(history);
	});

	it('keeps sparse flat and negative histories real without filling gaps', () => {
		const history = [
			'2021-03-14',
			'2021-03-31',
			'2024-02-29',
			'2026-11-10',
		].map((date) => ({ date, balance: -100 }));
		const result = sampleNetWorthHistory(history).snapshots;
		expect(result).toEqual(history);
		expect(result.every((point) => point.balance === -100)).toBe(true);
	});

	it('keeps monthly resolution when the selected series fits the budget exactly', () => {
		const history = Array.from({ length: 80 }, (_, month) => ({
			date: new Date(Date.UTC(2020, month + 1, 0))
				.toISOString()
				.slice(0, 10),
		}));
		const sampled = sampleNetWorthHistory(history, 80);
		expect(sampled.resolutionLabel).toBe('Monthly snapshots');
		expect(sampled.snapshots).toEqual(history);
	});

	it('reduces the captured all-time span to monthly period-ending points', () => {
		const history = dailyHistory('2021-03-14', '2026-11-10');
		const result = sampleNetWorthHistory(history, 80);
		expect(result.resolutionLabel).toBe('Monthly snapshots');
		expect(result.snapshots).toHaveLength(70);
		expect(result.snapshots[1].date).toBe('2021-03-31');
		expect(result.snapshots[69].date).toBe('2026-11-10');
	});

	it('quantizes the point budget and clamps it for very small or large widths', () => {
		expect(getNetWorthPointBudget(0)).toBe(80);
		expect(getNetWorthPointBudget(250)).toBe(80);
		expect(getNetWorthPointBudget(640)).toBe(160);
		expect(getNetWorthPointBudget(643)).toBe(160);
		expect(getNetWorthPointBudget(2000)).toBe(240);
	});
});

describe('net-worth change', () => {
	it('calculates growth and loss relative to a positive baseline', () => {
		expect(getNetWorthChange(1000, 1250)).toEqual({
			dollars: 250,
			percent: 0.25,
		});
		expect(getNetWorthChange(1000, 800)).toEqual({
			dollars: -200,
			percent: -0.2,
		});
	});

	it.each([0, -1000])(
		'omits misleading percentages for a baseline of %s',
		(first) => {
			expect(getNetWorthChange(first, 500)).toEqual({
				dollars: 500 - first,
				percent: null,
			});
		}
	);
});
