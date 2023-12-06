import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, LinearProgress, Typography, useTheme } from '@mui/material';
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
      <Grid xs={4} alignItems="flex-end">
        <Typography sx={{ fontSize: '1rem' }} variant="h4">
          {difficulty}
        </Typography>
      </Grid>
      <Grid xs={4}>
        <Typography sx={{ fontSize: '1rem' }} variant="h4">
          {solved} / {questions}
        </Typography>
      </Grid>
      <Grid xs={4} justifySelf="end">
        <Typography sx={{ fontSize: '1rem', textAlign: 'right' }} variant="h4">
          Beats {beats.toFixed(2)}%
        </Typography>
      </Grid>
    </Grid>
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
              sx={{ fontSize: '2.5rem', marginBottom: theme.spacing(0.5) }}
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
      .get('http://127.0.0.1:81/api/leetcode/solved')
      .then((response) => {
        setLeetCodeData(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <StyledCard variant="outlined">
      <StyledCardContent>
        <Typography
          sx={{ fontSize: '1.25rem', marginBottom: theme.spacing(0.5) }}
          variant="h2"
        >
          LeetCode
        </Typography>
        {leetCodeData && <LeetCodeSummary leetCodeData={leetCodeData} />}
      </StyledCardContent>
    </StyledCard>
  );
}

export default LeetCodeSummaryCard;
