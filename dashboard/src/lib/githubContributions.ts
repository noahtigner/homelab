import type { z } from 'zod';
import { formatCalendarDate } from '@/lib/calendarHeatmap';
import type {
	githubContributionCalendarSchema,
	githubContributionDaySchema,
} from '@/types/schemas';

export {
	getCalendarMonths as getContributionMonths,
	parseCalendarDate as parseContributionDate,
} from '@/lib/calendarHeatmap';

export type ContributionCalendar = z.infer<
	typeof githubContributionCalendarSchema
>;
export type ContributionDay = z.infer<typeof githubContributionDaySchema>;

// GitHub's levels, rather than locally computed quartiles, determine intensity.
export const contributionColors: Record<
	ContributionDay['contribution_level'],
	string
> = {
	NONE: 'var(--muted)',
	FIRST_QUARTILE: '#0e4429',
	SECOND_QUARTILE: '#006d32',
	THIRD_QUARTILE: '#26a641',
	FOURTH_QUARTILE: '#39d353',
};

export function describeContributionDay(day: ContributionDay) {
	return `${day.contribution_count.toLocaleString('en-US')} ${day.contribution_count === 1 ? 'contribution' : 'contributions'} on ${formatCalendarDate(day.date)}`;
}
