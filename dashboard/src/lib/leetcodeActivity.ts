import type { z } from 'zod';
import type { leetCodeActivityDaySchema } from '@/types/schemas';
import { formatCalendarDate } from '@/lib/calendarHeatmap';

export { unknownDayStyle } from '@/lib/calendarHeatmap';

export type LeetCodeActivityDay = z.infer<typeof leetCodeActivityDaySchema>;
export const difficultyColors = {
	easy: '#34d399',
	medium: '#f59e0b',
	hard: '#ef4444',
	empty: 'var(--muted)',
	unknown: 'var(--muted)',
};

export function activityColor(day: LeetCodeActivityDay) {
	return difficultyColors[
		day.coverage !== 'complete'
			? 'unknown'
			: (day.hardest_difficulty ?? 'empty')
	];
}

export function describeActivityDay(day: LeetCodeActivityDay) {
	const date = formatCalendarDate(day.date);
	if (day.coverage === 'unknown') return `${date}: history not yet known`;
	const counts = day.by_difficulty;
	const unknown =
		day.solved_count - counts.easy - counts.medium - counts.hard;
	return `${date}: ${day.coverage === 'partial' ? 'incomplete history; at least ' : ''}${day.solved_count} unique accepted ${day.solved_count === 1 ? 'problem' : 'problems'}. Easy ${counts.easy}, Medium ${counts.medium}, Hard ${counts.hard}${unknown > 0 ? `, unknown difficulty ${unknown}` : ''}.`;
}
