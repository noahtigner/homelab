import { Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
	useLeetCodeSolved,
	useLeetCodeLanguages,
} from '../../hooks/useLeetCode';

function LeetCodeProgressText({
	difficulty,
	solved,
	questions,
	beats,
}: {
	difficulty: 'Easy' | 'Medium' | 'Hard';
	solved: number;
	questions: number;
	beats: number;
}) {
	return (
		<div className="mb-1 grid grid-cols-3">
			<h4 className="text-sm">{difficulty}</h4>
			<h4 className="text-sm">
				{solved} / {questions}
			</h4>
			<h4 className="text-right text-sm">Beats {beats.toFixed(2)}%</h4>
		</div>
	);
}

function LeetCodeProgressSkeleton({
	difficulty,
}: {
	difficulty: 'Easy' | 'Medium' | 'Hard';
}) {
	return <h4 className="mb-0.5 text-sm">{difficulty}</h4>;
}

function LeetCodeLanguageChips() {
	const { isPending, error, data } = useLeetCodeLanguages();

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	if (isPending) {
		return (
			<ul className="mt-2 flex list-none flex-wrap items-start justify-start gap-2 p-0">
				{Array.from({ length: 3 }, (_, i) => (
					<li key={i}>
						<Badge variant="secondary">
							<Skeleton className="h-5 w-24 rounded" />
						</Badge>
					</li>
				))}
			</ul>
		);
	}

	return (
		<ul className="mt-2 flex list-none flex-wrap items-start justify-start gap-2 p-0">
			{data.map(({ languageName, problemsSolved }) => (
				<li key={languageName}>
					<Badge variant="secondary">
						{languageName}{' '}
						<strong className="text-muted-foreground">
							({problemsSolved})
						</strong>
					</Badge>
				</li>
			))}
		</ul>
	);
}

function LeetCodeSummary() {
	const { isPending, error, data } = useLeetCodeSolved();

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	if (isPending) {
		return (
			<div className="flex flex-col gap-2">
				<div className="mb-2 flex grow justify-between">
					<h3 className="text-2xl">Loading...</h3>
					<Trophy className="size-8 text-success-foreground" />
				</div>
				<LeetCodeProgressSkeleton difficulty="Easy" />
				<Progress
					value={0.1}
					className="h-1 [&_[data-slot=progress-indicator]]:bg-success-foreground"
				/>
				<LeetCodeProgressSkeleton difficulty="Medium" />
				<Progress
					value={0.1}
					className="h-1 [&_[data-slot=progress-indicator]]:bg-warning-foreground"
				/>
				<LeetCodeProgressSkeleton difficulty="Hard" />
				<Progress
					value={0.1}
					className="h-1 [&_[data-slot=progress-indicator]]:bg-destructive-foreground"
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="mb-2 flex grow justify-between">
				<h3 className="text-2xl">
					{data.all.solved} / {data.all.total}
				</h3>
				<Trophy className="size-8 text-success-foreground" />
			</div>
			<div>
				<LeetCodeProgressText
					difficulty="Easy"
					solved={data.easy.solved}
					questions={data.easy.total}
					beats={data.easy.beats_percent}
				/>
				<Progress
					value={data.easy.solved_percent}
					className="h-1 [&_[data-slot=progress-indicator]]:bg-success-foreground"
				/>
			</div>
			<div>
				<LeetCodeProgressText
					difficulty="Medium"
					solved={data.medium.solved}
					questions={data.medium.total}
					beats={data.medium.beats_percent}
				/>
				<Progress
					value={data.medium.solved_percent}
					className="h-1 [&_[data-slot=progress-indicator]]:bg-warning-foreground"
				/>
			</div>
			<div>
				<LeetCodeProgressText
					difficulty="Hard"
					solved={data.hard.solved}
					questions={data.hard.total}
					beats={data.hard.beats_percent}
				/>
				<Progress
					value={data.hard.solved_percent}
					className="h-1 [&_[data-slot=progress-indicator]]:bg-destructive-foreground"
				/>
			</div>
		</div>
	);
}

function LeetCodeSummaryCard() {
	return (
		<Card>
			<CardContent className="flex grow flex-col">
				<div className="mb-0.5 flex items-center">
					<img
						src="https://leetcode.com/favicon.ico"
						alt="LeetCode"
						width={20}
						className="mr-2"
					/>
					<a
						href={`https://leetcode.com/${import.meta.env.VITE_LEETCODE_USERNAME}/`}
						target="_blank"
						rel="noreferrer"
						className="no-underline text-inherit hover:text-primary"
					>
						<h2 className="text-xl">LeetCode</h2>
					</a>
				</div>
				<LeetCodeSummary />
				<div className="mt-auto">
					<LeetCodeLanguageChips />
				</div>
			</CardContent>
		</Card>
	);
}

export default LeetCodeSummaryCard;
