import {
	Box,
	Chip,
	Grid,
	LinearProgress,
	Link,
	Skeleton,
	Typography,
	useTheme,
} from '@mui/material';
import { EmojiEventsOutlined as TrophyIcon } from '@mui/icons-material';
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
		<Grid container sx={{ marginBottom: 0.5 }}>
			<Grid item xs={4} alignItems="flex-end">
				<Typography sx={{ fontSize: '1rem' }} variant="h4">
					{difficulty}
				</Typography>
			</Grid>
			<Grid item xs={4}>
				<Typography sx={{ fontSize: '1rem' }} variant="h4">
					{solved} / {questions}
				</Typography>
			</Grid>
			<Grid item xs={4} justifySelf="end">
				<Typography
					sx={{ fontSize: '1rem', textAlign: 'right' }}
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
		<Typography sx={{ fontSize: '1rem', marginBottom: 0.5 }} variant="h4">
			{difficulty}
		</Typography>
	);
}

function LeetCodeLanguageChips() {
	const { palette } = useTheme();

	const { isPending, error, data } = useLeetCodeLanguages();

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	if (isPending) {
		return (
			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'start',
					alignContent: 'start',
					listStyle: 'none',
					m: 0,
					marginTop: 1,
					p: 0,
					gap: 1,
				}}
				component="ul"
			>
				{Array.from({ length: 3 }, (_, i) => (
					<li key={i}>
						<Chip
							size="small"
							label={
								<>
									<Skeleton
										variant="text"
										width={100}
										height={24}
										sx={{ borderRadius: 1 }}
									/>
								</>
							}
						/>
					</li>
				))}
			</Box>
		);
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'start',
				alignContent: 'start',
				listStyle: 'none',
				m: 0,
				marginTop: 1,
				p: 0,
				gap: 1,
			}}
			component="ul"
		>
			{data.map(({ languageName, problemsSolved }) => (
				<li key={languageName}>
					<Chip
						size="small"
						label={
							<>
								{languageName}{' '}
								<strong
									style={{ color: palette.text.secondary }}
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
	const theme = useTheme();

	const { isPending, error, data } = useLeetCodeSolved();

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	if (isPending) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
				<Box
					sx={{
						display: 'flex',
						flexGrow: 1,
						justifyContent: 'space-between',
						marginBottom: theme.spacing(2),
					}}
				>
					<Typography
						sx={{
							fontSize: '2.5rem',
							marginBottom: theme.spacing(0.5),
						}}
						variant="h3"
					>
						Loading...
					</Typography>
					<TrophyIcon color="success" sx={{ fontSize: 48 }} />
				</Box>
				<LeetCodeProgressSkeleton difficulty="Easy" />
				<LinearProgress
					variant="determinate"
					value={0.1}
					color="success"
				/>
				<LeetCodeProgressSkeleton difficulty="Medium" />
				<LinearProgress
					variant="determinate"
					value={0.1}
					color="warning"
				/>
				<LeetCodeProgressSkeleton difficulty="Hard" />
				<LinearProgress
					variant="determinate"
					value={0.1}
					color="error"
				/>
			</Box>
		);
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
			<Box
				sx={{
					display: 'flex',
					flexGrow: 1,
					justifyContent: 'space-between',
					marginBottom: theme.spacing(2),
				}}
			>
				<Typography
					sx={{
						fontSize: '2.5rem',
						marginBottom: theme.spacing(0.5),
					}}
					variant="h3"
				>
					{data.all.solved} / {data.all.total}
				</Typography>
				<TrophyIcon color="success" sx={{ fontSize: 48 }} />
			</Box>
			<span>
				<LeetCodeProgressText
					difficulty="Easy"
					solved={data.easy.solved}
					questions={data.easy.total}
					beats={data.easy.beats_percent}
				/>
				<LinearProgress
					variant="determinate"
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
					variant="determinate"
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
					variant="determinate"
					value={data.hard.solved_percent}
					color="error"
				/>
			</span>
		</Box>
	);
}

function LeetCodeSummaryCard() {
	const theme = useTheme();

	return (
		<StyledCard variant="outlined">
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					sx={{ marginBottom: theme.spacing(0.5) }}
				>
					<img
						src="https://leetcode.com/favicon.ico"
						alt="LeetCode"
						width={20}
						style={{
							marginRight: theme.spacing(1),
							marginBottom: 2,
						}}
					/>
					<Link
						href={`https://leetcode.com/${
							import.meta.env.VITE_LEETCODE_USERNAME
						}/`}
						target="_blank"
						rel="noreferrer"
						sx={{ textDecoration: 'none', color: 'inherit' }}
					>
						<Typography
							sx={{
								fontSize: '1.25rem',
							}}
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
