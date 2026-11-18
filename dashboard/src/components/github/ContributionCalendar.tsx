import CalendarHeatmap from '@/components/charts/CalendarHeatmap';
import {
	contributionColors,
	describeContributionDay,
	type ContributionCalendar as CalendarData,
	type ContributionDay,
} from '@/lib/githubContributions';
import {
	ACTIVITY_CALENDAR_DAYS,
	fillCalendarDays,
	rollingCalendarRange,
	formatCalendarDate,
	parseCalendarDate,
	unknownDayStyle,
} from '@/lib/calendarHeatmap';

type CalendarCell = ContributionDay & { missing?: boolean };

export default function ContributionCalendar({
	calendar,
}: {
	calendar: CalendarData;
}) {
	const range = rollingCalendarRange(calendar.window_end);
	const days = fillCalendarDays<CalendarCell>(
		calendar.weeks.flatMap((week) => week.days),
		range,
		(date) => ({
			date,
			weekday: parseCalendarDate(date).getUTCDay(),
			contribution_count: 0,
			contribution_level: 'NONE',
			missing: true,
		})
	);
	const total = days.reduce((sum, day) => sum + day.contribution_count, 0);
	const describe = (day: CalendarCell) =>
		day.missing
			? `${formatCalendarDate(day.date)}: contribution data unavailable`
			: describeContributionDay(day);
	return (
		<section className="mt-2 min-w-0" aria-label="GitHub contributions">
			<h3 className="mb-2 text-base font-medium">
				{total.toLocaleString('en-US')} contributions in the last{' '}
				{ACTIVITY_CALENDAR_DAYS} days
			</h3>
			<CalendarHeatmap
				days={days}
				range={range}
				label="GitHub contribution calendar"
				getCellColor={(day) =>
					contributionColors[day.contribution_level]
				}
				getCellStyle={(day) => (day.missing ? unknownDayStyle : {})}
				getCellLabel={describe}
				renderTooltip={describe}
				legend={
					<div
						className="flex items-center gap-1"
						aria-label="Contribution intensity: less to more"
					>
						<span className="mr-1">Less</span>
						{Object.entries(contributionColors).map(
							([level, color]) => (
								<span
									key={level}
									aria-hidden="true"
									className="size-2.5 rounded-[2px] ring-1 ring-inset ring-foreground/5"
									style={{ backgroundColor: color }}
								/>
							)
						)}
						<span className="ml-1">More</span>
					</div>
				}
			/>
		</section>
	);
}
