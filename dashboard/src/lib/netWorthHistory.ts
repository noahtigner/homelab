export const netWorthPeriods = [
	{ value: '1m', label: '1 month' },
	{ value: '3m', label: '3 months' },
	{ value: '6m', label: '6 months' },
	{ value: 'ytd', label: 'YTD' },
	{ value: '1y', label: '1 year' },
	{ value: 'all', label: 'All time' },
] as const;

export type NetWorthPeriod = (typeof netWorthPeriods)[number]['value'];

function calendarDate(date: Date) {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, '0'),
		String(date.getDate()).padStart(2, '0'),
	].join('-');
}

function monthsBefore(date: Date, months: number) {
	const start = new Date(date.getFullYear(), date.getMonth() - months, 1);
	const lastDay = new Date(
		start.getFullYear(),
		start.getMonth() + 1,
		0
	).getDate();
	start.setDate(Math.min(date.getDate(), lastDay));
	return start;
}

export function getNetWorthDateRange(
	period: NetWorthPeriod,
	today = new Date()
) {
	const end_date = calendarDate(today);
	if (period === 'all') return { end_date };
	if (period === 'ytd') {
		return { start_date: `${today.getFullYear()}-01-01`, end_date };
	}
	const months = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }[period];
	return { start_date: calendarDate(monthsBefore(today, months)), end_date };
}

// ISO calendar dates must not shift to the previous day in western time zones.
export function parseHistoryDate(value: string) {
	const [year, month, day] = value.split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function getNetWorthChange(first: number, last: number) {
	const dollars = last - first;
	return {
		dollars,
		percent: first > 0 ? dollars / first : null,
	};
}

export function getNetWorthTotal(
	summaries: readonly {
		type: { group: 'asset' | 'liability' };
		totalDisplayBalance: number;
	}[]
) {
	return summaries.reduce(
		(total, summary) =>
			total +
			(summary.type.group === 'asset'
				? summary.totalDisplayBalance
				: -summary.totalDisplayBalance),
		0
	);
}

export function getNetWorthPointBudget(plotWidth: number) {
	return Math.max(80, Math.min(240, Math.floor(plotWidth / 4)));
}

type SnapshotResolution = 'day' | 'week' | 'month';

function snapshotBucket(value: string, resolution: SnapshotResolution) {
	const [year, month, day] = value.split('-').map(Number);
	if (resolution === 'month') return year * 12 + month - 1;
	// Calendar-day ordinals avoid local DST changing bucket boundaries.
	const ordinal = Date.UTC(year, month - 1, day) / (24 * 60 * 60 * 1000);
	// Epoch day zero was Thursday; adding three aligns weeks to Monday.
	return resolution === 'week' ? Math.floor((ordinal + 3) / 7) : ordinal;
}

function resolutionLabel(resolution: SnapshotResolution, stride: number) {
	if (stride > 1) return `Every ${stride} ${resolution}s`;
	return (
		{ day: 'Daily', week: 'Weekly', month: 'Monthly' }[resolution] +
		' snapshots'
	);
}

/** Select real period-ending snapshots from sorted, unique daily history. */
export function sampleNetWorthHistory<T extends { date: string }>(
	snapshots: readonly T[],
	maxPoints = 240
) {
	if (snapshots.length < 2) {
		return { snapshots, resolutionLabel: 'Daily snapshots' };
	}
	const first = snapshots[0];
	const last = snapshots[snapshots.length - 1];
	const end = parseHistoryDate(last.date);
	const resolution: SnapshotResolution =
		first.date >= calendarDate(monthsBefore(end, 6))
			? 'day'
			: first.date >= calendarDate(monthsBefore(end, 24))
				? 'week'
				: 'month';
	const budget = Math.max(3, Math.floor(maxPoints));
	if (resolution === 'day' && snapshots.length <= budget) {
		return { snapshots, resolutionLabel: 'Daily snapshots' };
	}
	const firstBucket = snapshotBucket(first.date, resolution);
	const buckets = new Map<number, T>();
	for (const snapshot of snapshots) {
		buckets.set(snapshotBucket(snapshot.date, resolution), snapshot);
	}
	let stride = 1;
	// Reserve room for exact endpoints independently of the calendar buckets.
	const extraEndpoint = buckets.get(firstBucket)?.date === first.date ? 0 : 1;
	if (buckets.size + extraEndpoint > budget) {
		const span = snapshotBucket(last.date, resolution) - firstBucket + 1;
		stride = Math.ceil(span / (budget - 2));
	}
	const grouped = new Map<number, T>();
	for (const [bucket, snapshot] of buckets) {
		grouped.set(Math.floor((bucket - firstBucket) / stride), snapshot);
	}
	const selected = [first];
	for (const snapshot of grouped.values()) {
		if (selected[selected.length - 1].date !== snapshot.date) {
			selected.push(snapshot);
		}
	}
	if (selected[selected.length - 1].date !== last.date) selected.push(last);
	return {
		snapshots: selected,
		resolutionLabel: resolutionLabel(resolution, stride),
	};
}
