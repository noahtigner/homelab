import {
	Box,
	Chip,
	Grid,
	LinearProgress,
	Link,
	Skeleton,
	Typography,
} from '../ui';
import { TrophyIcon } from '../icons';
import { StyledCard, StyledCardContent } from '../StyledCard';
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
		<Grid
			container
			style={{ marginBottom: 'calc(var(--spacing-unit) * 0.5)' }}
		>
			<Grid xs={4}>
				<Typography style={{ fontSize: '1rem' }} variant="h4">
					{difficulty}
				</Typography>
			</Grid>
			<Grid xs={4}>
				<Typography style={{ fontSize: '1rem' }} variant="h4">
					{solved} / {questions}
				</Typography>
			</Grid>
			<Grid xs={4}>
				<Typography
					style={{ fontSize: '1rem', textAlign: 'right' }}
					variant="h4"
				>
					Beats {beats.toFixed(2)}%
				</Typography>
			</Grid>
		</Grid>
	);
}

function LeetCodeProgressSkeleton({
	difficulty,
}: {
	difficulty: 'Easy' | 'Medium' | 'Hard';
}) {
	return (
		<Typography
			style={{
				fontSize: '1rem',
				marginBottom: 'calc(var(--spacing-unit) * 0.5)',
			}}
			variant="h4"
		>
			{difficulty}
		</Typography>
	);
}

function LeetCodeLanguageChips() {
	const { isPending, error, data } = useLeetCodeLanguages();

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	if (isPending) {
		return (
			<Box
				component="ul"
				display="flex"
				flexWrap="wrap"
				justifyContent="flex-start"
				alignItems="flex-start"
				gap={1}
				style={{
					listStyle: 'none',
					margin: 0,
					marginTop: 'calc(var(--spacing-unit) * 1)',
					padding: 0,
				}}
			>
				{Array.from({ length: 3 }, (_, i) => (
					<li key={i}>
						<Chip
							size="small"
							label={
								<Skeleton
									variant="text"
									width={100}
									height={24}
								/>
							}
						/>
					</li>
				))}
			</Box>
		);
	}

	return (
		<Box
			component="ul"
			display="flex"
			flexWrap="wrap"
			justifyContent="flex-start"
			alignItems="flex-start"
			gap={1}
			style={{
				listStyle: 'none',
				margin: 0,
				marginTop: 'calc(var(--spacing-unit) * 1)',
				padding: 0,
			}}
		>
			{data.map(({ languageName, problemsSolved }) => (
				<li key={languageName}>
					<Chip
						size="small"
						label={
							<>
								{languageName}{' '}
								<strong
									style={{
										color: 'var(--color-text-secondary)',
									}}
								>
									({problemsSolved})
								</strong>
							</>
						}
					/>
				</li>
			))}
		</Box>
	);
}

function LeetCodeSummary() {
	const { isPending, error, data } = useLeetCodeSolved();

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	if (isPending) {
		return (
			<Box display="flex" flexDirection="column" gap={1.5}>
				<Box
					display="flex"
					flexGrow={1}
					justifyContent="space-between"
					style={{ marginBottom: 'calc(var(--spacing-unit) * 2)' }}
				>
					<Typography
						style={{
							fontSize: '2.5rem',
							marginBottom: 'calc(var(--spacing-unit) * 0.5)',
						}}
						variant="h3"
					>
						Loading...
					</Typography>
					<TrophyIcon color="success" fontSize={48} />
				</Box>
				<LeetCodeProgressSkeleton difficulty="Easy" />
				<LinearProgress value={0.1} color="success" />
				<LeetCodeProgressSkeleton difficulty="Medium" />
				<LinearProgress value={0.1} color="warning" />
				<LeetCodeProgressSkeleton difficulty="Hard" />
				<LinearProgress value={0.1} color="error" />
			</Box>
		);
	}

	return (
		<Box display="flex" flexDirection="column" gap={1.5}>
			<Box
				display="flex"
				flexGrow={1}
				justifyContent="space-between"
				style={{ marginBottom: 'calc(var(--spacing-unit) * 2)' }}
			>
				<Typography
					style={{
						fontSize: '2.5rem',
						marginBottom: 'calc(var(--spacing-unit) * 0.5)',
					}}
					variant="h3"
				>
					{data.all.solved} / {data.all.total}
				</Typography>
				<TrophyIcon color="success" fontSize={48} />
			</Box>
			<span>
				<LeetCodeProgressText
					difficulty="Easy"
					solved={data.easy.solved}
					questions={data.easy.total}
					beats={data.easy.beats_percent}
				/>
				<LinearProgress
					value={data.easy.solved_percent}
					color="success"
				/>
			</span>
			<span>
				<LeetCodeProgressText
					difficulty="Medium"
					solved={data.medium.solved}
					questions={data.medium.total}
					beats={data.medium.beats_percent}
				/>
				<LinearProgress
					value={data.medium.solved_percent}
					color="warning"
				/>
			</span>
			<span>
				<LeetCodeProgressText
					difficulty="Hard"
					solved={data.hard.solved}
					questions={data.hard.total}
					beats={data.hard.beats_percent}
				/>
				<LinearProgress
					value={data.hard.solved_percent}
					color="error"
				/>
			</span>
		</Box>
	);
}

function LeetCodeSummaryCard() {
	return (
		<StyledCard>
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					style={{ marginBottom: 'calc(var(--spacing-unit) * 0.5)' }}
				>
					<img
						src="https://leetcode.com/favicon.ico"
						alt="LeetCode"
						width={20}
						style={{
							marginRight: 'calc(var(--spacing-unit) * 1)',
							marginBottom: 2,
						}}
					/>
					<Link
						href={`https://leetcode.com/${
							import.meta.env.VITE_LEETCODE_USERNAME
						}/`}
						target="_blank"
						rel="noreferrer"
						style={{ textDecoration: 'none', color: 'inherit' }}
					>
						<Typography
							style={{ fontSize: '1.25rem' }}
							variant="h2"
						>
							LeetCode
						</Typography>
					</Link>
				</Box>
				<LeetCodeSummary />
				<LeetCodeLanguageChips />
			</StyledCardContent>
		</StyledCard>
	);
}

export default LeetCodeSummaryCard;
