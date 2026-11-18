export type CalendarDay = { date: string };
export type CalendarRange = { start: string; end: string };
export const ACTIVITY_CALENDAR_DAYS = 366;
export const unknownDayStyle = {
	backgroundImage:
		'repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(255,255,255,0.28) 2px, rgba(255,255,255,0.28) 3px)',
};
export type CalendarWeek<T extends CalendarDay> = {
	first_day: string;
	days: T[];
};

export const parseCalendarDate = (date: string) =>
	new Date(`${date}T00:00:00Z`);

export function rollingCalendarRange(end: string): CalendarRange {
	const start = parseCalendarDate(end);
	start.setUTCDate(start.getUTCDate() - ACTIVITY_CALENDAR_DAYS + 1);
	return { start: start.toISOString().slice(0, 10), end };
}

export function fillCalendarDays<T extends CalendarDay>(
	days: T[],
	range: CalendarRange,
	missing: (date: string) => T
): T[] {
	const byDate = new Map(days.map((day) => [day.date, day]));
	const result: T[] = [];
	const date = parseCalendarDate(range.start);
	while (date.toISOString().slice(0, 10) <= range.end) {
		const iso = date.toISOString().slice(0, 10);
		result.push(byDate.get(iso) ?? missing(iso));
		date.setUTCDate(date.getUTCDate() + 1);
	}
	return result;
}
export const formatCalendarDate = (date: string) =>
	new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(parseCalendarDate(date));

export function buildCalendarWeeks<T extends CalendarDay>(
	days: T[],
	range: CalendarRange
): CalendarWeek<T>[] {
	const byDate = new Map(days.map((day) => [day.date, day]));
	const weeks: CalendarWeek<T>[] = [];
	const date = parseCalendarDate(range.start);
	while (date.toISOString().slice(0, 10) <= range.end) {
		const first = new Date(date);
		first.setUTCDate(first.getUTCDate() - first.getUTCDay());
		const firstDay = first.toISOString().slice(0, 10);
		if (weeks[weeks.length - 1]?.first_day !== firstDay)
			weeks.push({ first_day: firstDay, days: [] });
		const day = byDate.get(date.toISOString().slice(0, 10));
		if (day) weeks[weeks.length - 1].days.push(day);
		date.setUTCDate(date.getUTCDate() + 1);
	}
	return weeks;
}

export function getCalendarMonths<T extends CalendarDay>(
	weeks: CalendarWeek<T>[]
) {
	const formatter = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		timeZone: 'UTC',
	});
	const months: { key: string; label: string; columns: number }[] = [];
	for (const week of weeks) {
		const date =
			(week.days.find((day) => day.date.endsWith('-01')) ?? week.days[0])
				?.date ?? week.first_day;
		const key = date.slice(0, 7);
		const previous = months[months.length - 1];
		if (previous?.key === key) previous.columns++;
		else
			months.push({
				key,
				label: formatter.format(parseCalendarDate(date)),
				columns: 1,
			});
	}
	return months;
}
