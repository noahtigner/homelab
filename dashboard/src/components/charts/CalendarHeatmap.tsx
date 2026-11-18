import {
	useId,
	memo,
	useMemo,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
	type KeyboardEvent,
	type ReactNode,
	type CSSProperties,
} from 'react';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import {
	buildCalendarWeeks,
	getCalendarMonths,
	parseCalendarDate,
	type CalendarDay,
	type CalendarRange,
} from '@/lib/calendarHeatmap';

type CellPresentation<T> = {
	getCellColor: (day: T) => string;
	getCellLabel: (day: T) => string;
	renderTooltip: (day: T) => ReactNode;
	getCellStyle?: (day: T) => CSSProperties;
};

const weekdays = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
];

function CalendarSquare<T extends CalendarDay>({
	day,
	active,
	onSelect,
	onKeyDown,
	getCellColor,
	getCellLabel,
	renderTooltip,
	getCellStyle,
}: {
	day: T;
	active: boolean;
	onSelect: (date: string) => void;
	onKeyDown: (event: KeyboardEvent, day: T) => void;
} & CellPresentation<T>) {
	return (
		<Tooltip>
			<TooltipTrigger
				type="button"
				tabIndex={active ? 0 : -1}
				aria-label={getCellLabel(day)}
				onFocus={() => onSelect(day.date)}
				onClick={() => onSelect(day.date)}
				onKeyDown={(event) => onKeyDown(event, day)}
				data-date={day.date}
				className="block aspect-square w-full cursor-pointer rounded-[2px] p-0 ring-1 ring-inset ring-foreground/5 hover:outline-1 hover:outline-foreground/60 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-ring"
				style={{
					backgroundColor: getCellColor(day),
					...getCellStyle?.(day),
				}}
			/>
			<TooltipContent role="tooltip" tone="dark">
				{renderTooltip(day)}
			</TooltipContent>
		</Tooltip>
	);
}

const MemoizedCalendarSquare = memo(CalendarSquare) as typeof CalendarSquare;

export default function CalendarHeatmap<T extends CalendarDay>({
	days: inputDays,
	range,
	label,
	legend,
	renderSelectedDay,
	...presentation
}: {
	days: T[];
	range: CalendarRange;
	label: string;
	legend?: ReactNode;
	renderSelectedDay?: (day: T) => ReactNode;
} & CellPresentation<T>) {
	const [activeDate, setActiveDate] = useState<string>();
	const scrollRef = useRef<HTMLDivElement>(null);
	const instructionsId = useId();
	const weeks = useMemo(
		() =>
			buildCalendarWeeks(inputDays, {
				start: range.start,
				end: range.end,
			}),
		[inputDays, range.start, range.end]
	);
	const days = useMemo(
		() =>
			weeks
				.flatMap((week) => week.days)
				.sort((a, b) => a.date.localeCompare(b.date)),
		[weeks]
	);
	const selected =
		days.find((day) => day.date === activeDate) ?? days[days.length - 1];
	const months = getCalendarMonths(weeks);

	useLayoutEffect(() => {
		const scroll = scrollRef.current;
		if (scroll) scroll.scrollLeft = scroll.scrollWidth;
	}, [range.end]);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent, day: T) => {
			let target: string | undefined;
			if (event.key === 'Home') target = days[0].date;
			else if (event.key === 'End') target = days[days.length - 1].date;
			else {
				const offset = {
					ArrowLeft: -7,
					ArrowRight: 7,
					ArrowUp: -1,
					ArrowDown: 1,
				}[event.key];
				if (offset === undefined) return;
				event.preventDefault();
				if (
					(event.key === 'ArrowUp' &&
						parseCalendarDate(day.date).getUTCDay() === 0) ||
					(event.key === 'ArrowDown' &&
						parseCalendarDate(day.date).getUTCDay() === 6)
				)
					return;
				const date = parseCalendarDate(day.date);
				date.setUTCDate(date.getUTCDate() + offset);
				target = date.toISOString().slice(0, 10);
			}
			event.preventDefault();
			const button = scrollRef.current?.querySelector<HTMLElement>(
				`button[data-date="${target}"]`
			);
			if (button) {
				button.focus({ preventScroll: true });
				button.scrollIntoView?.({
					block: 'nearest',
					inline: 'nearest',
				});
			}
		},
		[days]
	);

	if (!selected)
		return (
			<p className="text-sm text-muted-foreground">
				No calendar data available.
			</p>
		);
	return (
		<div className="min-w-0">
			<p id={instructionsId} className="sr-only">
				Use arrow keys to move by day or week. Home and End move to the
				first and last day.
			</p>
			<TooltipProvider delay={150}>
				<div
					ref={scrollRef}
					tabIndex={-1}
					className="overflow-x-auto pb-1"
				>
					<table
						role="grid"
						aria-label={label}
						aria-describedby={instructionsId}
						className="w-full min-w-[640px] table-fixed border-separate text-[10px] text-muted-foreground [border-spacing:3px]"
					>
						<thead>
							<tr>
								<td className="sticky left-0 z-10 w-7 bg-card" />
								{months.map((month) => (
									<th
										key={month.key}
										colSpan={month.columns}
										scope="colgroup"
										className="h-4 overflow-hidden text-left font-normal whitespace-nowrap"
									>
										{month.columns > 1 ? (
											month.label
										) : (
											<span className="sr-only">
												{month.label}
											</span>
										)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{weekdays.map((weekday, row) => (
								<tr key={weekday}>
									<th
										scope="row"
										className="sticky left-0 z-10 bg-card pr-1 text-left font-normal"
									>
										<span
											className={
												row % 2 === 1
													? undefined
													: 'sr-only'
											}
										>
											{row % 2 === 1
												? weekday.slice(0, 3)
												: weekday}
										</span>
									</th>
									{weeks.map((week) => {
										const day = week.days.find(
											(entry) =>
												parseCalendarDate(
													entry.date
												).getUTCDay() === row
										);
										return (
											<td
												key={week.first_day}
												role="gridcell"
												className="p-0"
											>
												{day ? (
													<MemoizedCalendarSquare
														day={day}
														active={
															day.date ===
															selected.date
														}
														onSelect={setActiveDate}
														onKeyDown={
															handleKeyDown
														}
														{...presentation}
													/>
												) : (
													<span
														aria-hidden="true"
														className="block aspect-square"
													/>
												)}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</TooltipProvider>
			<div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[10px] text-muted-foreground">
				<div aria-live="polite">
					{renderSelectedDay
						? renderSelectedDay(selected)
						: presentation.getCellLabel(selected)}
				</div>
				{legend}
			</div>
		</div>
	);
}
