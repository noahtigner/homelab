import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalendarHeatmap from './CalendarHeatmap';
import {
	buildCalendarWeeks,
	fillCalendarDays,
	rollingCalendarRange,
} from '@/lib/calendarHeatmap';

const days = [
	{ date: '2024-02-28', score: 1 },
	{ date: '2024-02-29', score: 2 },
	{ date: '2024-03-01', score: 3 },
];
const presentation = {
	getCellColor: (day: (typeof days)[number]) =>
		day.score > 1 ? 'red' : 'green',
	getCellLabel: (day: (typeof days)[number]) =>
		`${day.date}: score ${day.score}`,
	renderTooltip: (day: (typeof days)[number]) => (
		<strong>Score {day.score}</strong>
	),
};

describe('composable calendar heatmap', () => {
	it.each([
		['2024-03-01', '2023-03-02'],
		['2024-02-29', '2023-03-01'],
		['2026-11-14', '2025-11-14'],
	])(
		'normalizes %s to exactly 366 dates without counting week padding or extra source days',
		(end, start) => {
			const range = rollingCalendarRange(end);
			expect(range).toEqual({ start, end });
			const normalized = fillCalendarDays(
				[
					{ date: '2000-01-01', known: true },
					{ date: end, known: true },
					{ date: '2099-01-01', known: true },
				],
				range,
				(date) => ({ date, known: false })
			);
			expect(normalized).toHaveLength(366);
			expect(new Set(normalized.map((day) => day.date)).size).toBe(366);
			expect(normalized[0].date).toBe(start);
			expect(normalized[365]).toEqual({ date: end, known: true });
			expect(
				buildCalendarWeeks(normalized, range).flatMap(
					(week) => week.days
				)
			).toHaveLength(366);
		}
	);
	it('uses source-provided styles, labels, rich tooltips, legend and selection content', async () => {
		const user = userEvent.setup();
		render(
			<CalendarHeatmap
				days={days}
				range={{ start: '2024-02-28', end: '2024-03-01' }}
				label="Custom calendar"
				{...presentation}
				legend={<span>Custom legend</span>}
				renderSelectedDay={(day) => (
					<span>Selected score {day.score}</span>
				)}
			/>
		);
		const button = screen.getByRole('button', {
			name: '2024-02-29: score 2',
		});
		expect(button).toHaveStyle({ backgroundColor: '#ff0000' });
		expect(screen.getByText('Custom legend')).toBeVisible();
		await user.hover(button);
		expect(await screen.findByRole('tooltip')).toHaveTextContent('Score 2');
		await user.click(button);
		expect(screen.getByText('Selected score 2')).toBeVisible();
	});

	it('keeps focus and selection scoped when two sources share the same dates', async () => {
		const user = userEvent.setup();
		render(
			<>
				<CalendarHeatmap
					days={days}
					range={{ start: '2024-02-28', end: '2024-03-01' }}
					label="First calendar"
					{...presentation}
				/>
				<CalendarHeatmap
					days={days}
					range={{ start: '2024-02-28', end: '2024-03-01' }}
					label="Second calendar"
					{...presentation}
				/>
			</>
		);
		const first = screen.getByRole('grid', { name: 'First calendar' });
		const second = screen.getByRole('grid', { name: 'Second calendar' });
		await user.tab();
		await user.keyboard('{ArrowUp}');
		expect(
			within(first).getByRole('button', { name: '2024-02-29: score 2' })
		).toHaveFocus();
		expect(second.querySelector('button[tabindex="0"]')).toHaveAttribute(
			'data-date',
			'2024-03-01'
		);
		await user.tab();
		await user.keyboard('{Home}');
		expect(
			within(second).getByRole('button', { name: '2024-02-28: score 1' })
		).toHaveFocus();
	});

	it('pads partial weeks, excludes dates outside the requested range and leaves missing data unfilled', () => {
		const weeks = buildCalendarWeeks(days, {
			start: '2024-02-29',
			end: '2024-03-02',
		});
		expect(weeks).toEqual([
			{ first_day: '2024-02-25', days: days.slice(1) },
		]);
		render(
			<CalendarHeatmap
				days={[]}
				range={{ start: '2024-02-28', end: '2024-03-01' }}
				label="Empty calendar"
				{...presentation}
			/>
		);
		expect(screen.getByText('No calendar data available.')).toBeVisible();
	});
});
