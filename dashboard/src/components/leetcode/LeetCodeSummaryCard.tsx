import { useState, useEffect } from 'react';
import axios from 'axios';
import {
	Box,
	Chip,
	Grid,
	LinearProgress,
	Link,
	Typography,
	useTheme,
} from '@mui/material';
import { EmojiEventsOutlined as TrophyIcon } from '@mui/icons-material';
import { StyledCard, StyledCardContent } from '../StyledCard';

interface LCProblemDifficulty {
	total: number;
	solved: number;
	solved_percent: number;
	beats_percent: number;
}

interface LCProblemAll extends Omit<LCProblemDifficulty, 'beats_percent'> {
	beats_percent: null;
}

interface LeetCodeSolvedData {
	all: LCProblemAll;
	easy: LCProblemDifficulty;
	medium: LCProblemDifficulty;
	hard: LCProblemDifficulty;
}

interface LeetCodeLanguage {
	languageName: string;
	problemsSolved: number;
}

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

function LeetCodeLanguageChips() {
	const { palette } = useTheme();
	const [lcLanguageData, setLcLanguageData] = useState<LeetCodeLanguage[]>(
		[]
	);

	useEffect(() => {
		axios
			.get(`${import.meta.env.VITE_API_BASE}/leetcode/languages/`)
			.then((response) => {
				setLcLanguageData(response.data);
			})
			.catch((error) => console.error(error));
	}, []);

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
			{lcLanguageData.map(({ languageName, problemsSolved }) => (
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

function LeetCodeSummary({
	leetCodeData,
}: {
	leetCodeData: LeetCodeSolvedData;
}) {
	const theme = useTheme();

	return (
		<>
			{leetCodeData && (
				<Box
					sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
				>
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
							{leetCodeData.all.solved} / {leetCodeData.all.total}
						</Typography>
						<TrophyIcon color="success" sx={{ fontSize: 48 }} />
					</Box>
					<span>
						<LeetCodeProgressText
							difficulty="Easy"
							solved={leetCodeData.easy.solved}
							questions={leetCodeData.easy.total}
							beats={leetCodeData.easy.beats_percent}
						/>
						<LinearProgress
							variant="determinate"
							value={leetCodeData.easy.solved_percent}
							color="success"
						/>
					</span>
					<span>
						<LeetCodeProgressText
							difficulty="Medium"
							solved={leetCodeData.medium.solved}
							questions={leetCodeData.medium.total}
							beats={leetCodeData.medium.beats_percent}
						/>
						<LinearProgress
							variant="determinate"
							value={leetCodeData.medium.solved_percent}
							color="warning"
						/>
					</span>
					<span>
						<LeetCodeProgressText
							difficulty="Hard"
							solved={leetCodeData.hard.solved}
							questions={leetCodeData.hard.total}
							beats={leetCodeData.hard.beats_percent}
						/>
						<LinearProgress
							variant="determinate"
							value={leetCodeData.hard.solved_percent}
							color="error"
						/>
					</span>
				</Box>
			)}
		</>
	);
}

function LeetCodeSummaryCard() {
	const theme = useTheme();

	const [leetCodeData, setLeetCodeData] = useState<LeetCodeSolvedData | null>(
		null
	);

	useEffect(() => {
		axios
			.get(`${import.meta.env.VITE_API_BASE}/leetcode/solved/`)
			.then((response) => {
				setLeetCodeData(response.data);
			})
			.catch((error) => console.error(error));
	}, []);

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
				{leetCodeData && (
					<LeetCodeSummary leetCodeData={leetCodeData} />
				)}
				<LeetCodeLanguageChips />
			</StyledCardContent>
		</StyledCard>
	);
}

export default LeetCodeSummaryCard;
