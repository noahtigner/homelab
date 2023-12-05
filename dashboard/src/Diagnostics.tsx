import { ReactNode, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  CheckCircle as CheckCircleIcon,
  DnsOutlined as DnsIcon,
  Block as BlockIcon,
  AccessTime as AccessTimeIcon,
  SaveOutlined as SaveIcon,
  DeviceThermostatOutlined as DeviceThermostatOutlinedIcon,
  MemoryOutlined as MemoryIcon,
  CircleOutlined as CircleIcon,
  ErrorOutlineOutlined as ErrorCircleIcon,
  EmojiEventsOutlined as TrophyIcon,
} from '@mui/icons-material';

const StyledCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  margin: theme.spacing(2),
  padding: theme.spacing(1),
  paddingBottom: 0,
  '&:last-child': {
    padding: 0,
  },
}));

interface PiholeData {
  domains_being_blocked: number;
  dns_queries_today: number;
  ads_blocked_today: number;
  ads_percentage_today: number;
  unique_domains: number;
  queries_forwarded: number;
  queries_cached: number;
  clients_ever_seen: number;
  unique_clients: number;
  dns_queries_all_types: number;
  reply_NODATA: number;
  reply_NXDOMAIN: number;
  reply_CNAME: number;
  reply_IP: number;
  privacy_level: number;
  status: string;
  gravity_last_updated: {
    file_exists: boolean;
    absolute: number;
    relative: {
      days: number;
      hours: number;
      minutes: number;
    };
  };
}

interface DiangosticsData {
  cpu: {
    count: number;
    percent: number[];
    temp: number;
  };
  memory: {
    total: number;
    used: number;
    available: number;
    percent: number;
  };
  disk: {
    total: number;
    used: number;
    available: number;
    percent: number;
  };
  pids: number[];
}

const celsiusToFahrenheit = (celsius: number): number => (celsius * 9) / 5 + 32;

function PiholeSummaryCard({
  title,
  value1,
  value2,
  icon,
}: {
  title: string;
  value1: string | number;
  value2: string | number;
  icon: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Grid xs={12} sm={6} md={4}>
      <StyledCard variant="outlined">
        <StyledCardContent>
          <Typography
            sx={{ fontSize: '1.25rem', marginBottom: theme.spacing(0.5) }}
            variant="h2"
          >
            {title}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexGrow: 1,
              justifyContent: 'space-between',
            }}
          >
            <Typography
              sx={{ fontSize: '2.5rem', marginBottom: theme.spacing(0.5) }}
              variant="h3"
            >
              {value1}
            </Typography>
            {icon}
          </Box>
          <Typography sx={{ fontSize: '1rem' }} variant="h4">
            {value2}
          </Typography>
        </StyledCardContent>
      </StyledCard>
    </Grid>
  );
}

function DiagnosticsCard({
  title,
  values,
  icon,
}: {
  title: string;
  values: string[];
  icon: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Grid xs={12} sm={6} md={3}>
      <StyledCard variant="outlined">
        <StyledCardContent>
          <Typography
            sx={{ fontSize: '1.25rem', marginBottom: theme.spacing(0.5) }}
            variant="h2"
          >
            {title}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexGrow: 1,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              {values.map((v) => (
                <Typography
                  key={v}
                  sx={{
                    fontSize: values.length > 1 ? '1rem' : '2.5rem',
                    wordBreak: 'break-word',
                  }}
                  variant={'h3'}
                >
                  {v}
                </Typography>
              ))}
            </Box>
            {icon}
          </Box>
        </StyledCardContent>
      </StyledCard>
    </Grid>
  );
}

type ServiceStatus = 'ok' | 'warning' | 'error' | 'loading';

const statusToColor = (status: ServiceStatus) => {
  switch (status) {
    case 'ok':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'loading':
    default:
      return 'default';
  }
};

const statusToIcon = (status: ServiceStatus) => {
  switch (status) {
    case 'ok':
      return <CheckCircleIcon />;
    case 'warning':
    case 'error':
      return <ErrorCircleIcon />;
    case 'loading':
    default:
      return <CircleIcon />;
  }
};

function StatusChip({
  label,
  status,
}: {
  label: string;
  status: ServiceStatus;
}) {
  return (
    <Chip
      label={label}
      color={statusToColor(status)}
      icon={statusToIcon(status)}
      sx={{ justifyContent: 'start' }}
      // sx={{
      //   paddingY: '4px',
      //   justifyContent: 'start',
      //   // height: 'auto',
      //   '& .MuiChip-label': {
      //     display: 'block',
      //     whiteSpace: 'normal',
      //   },
      // }}
    />
  );
}

interface DockerData {
  containers: {
    id: string;
    name: string;
    cpu_usage: number;
    memory_usage: number;
    memory_limit: number;
    network_in: number;
    network_out: number;
    network_dropped: number;
    block_in: number;
    block_out: number;
    pids: number;
  }[];
  system_cpu_usage: number;
}

const bitsToMegabits = (bits: number): string => (bits / 1000000).toFixed(2);
const bitsToGigabytes = (bits: number): string =>
  (bits / 1000000000).toFixed(2);

interface LeetCodeSolvedData {
  allQuestionsCount: {
    difficulty: 'All' | 'Easy' | 'Medium' | 'Hard';
    count: number;
  }[];
  matchedUser: {
    problemsSolvedBeatsStats: {
      difficulty: 'Easy' | 'Medium' | 'Hard';
      percentage: number;
    }[];
    submitStatsGlobal: {
      acSubmissionNum: {
        difficulty: 'All' | 'Easy' | 'Medium' | 'Hard';
        count: number;
      }[];
    };
  };
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
    <Grid container>
      <Grid xs={4}>
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

  const totalQuestions = leetCodeData?.allQuestionsCount[0].count;
  const easyQuestions = leetCodeData?.allQuestionsCount[1].count;
  const mediumQuestions = leetCodeData?.allQuestionsCount[2].count;
  const hardQuestions = leetCodeData?.allQuestionsCount[3].count;

  const totalSolved =
    leetCodeData?.matchedUser.submitStatsGlobal.acSubmissionNum[0].count;
  const easySolved =
    leetCodeData?.matchedUser.submitStatsGlobal.acSubmissionNum[1].count;
  const mediumSolved =
    leetCodeData?.matchedUser.submitStatsGlobal.acSubmissionNum[2].count;
  const hardSolved =
    leetCodeData?.matchedUser.submitStatsGlobal.acSubmissionNum[3].count;

  const easyBeats =
    leetCodeData?.matchedUser.problemsSolvedBeatsStats[0].percentage;
  const mediumBeats =
    leetCodeData?.matchedUser.problemsSolvedBeatsStats[1].percentage;
  const hardBeats =
    leetCodeData?.matchedUser.problemsSolvedBeatsStats[2].percentage;

  // const

  return (
    <>
      {leetCodeData && (
        <>
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
              {totalSolved}/{totalQuestions}
            </Typography>
            <TrophyIcon color="success" sx={{ fontSize: 48 }} />
          </Box>
          <LeetCodeProgressText
            difficulty="Easy"
            solved={easySolved}
            questions={easyQuestions}
            beats={easyBeats}
          />
          <LinearProgress
            variant="determinate"
            value={(easySolved / easyQuestions) * 100}
            color="success"
          />
          <LeetCodeProgressText
            difficulty="Medium"
            solved={mediumSolved}
            questions={mediumQuestions}
            beats={mediumBeats}
          />
          <LinearProgress
            variant="determinate"
            value={(mediumSolved / mediumQuestions) * 100}
            color="warning"
          />
          <LeetCodeProgressText
            difficulty="Hard"
            solved={hardSolved}
            questions={hardQuestions}
            beats={hardBeats}
          />
          <LinearProgress
            variant="determinate"
            value={(hardSolved / hardQuestions) * 100}
            color="error"
          />
        </>
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
      .get('http://192.168.0.69:81/api/leetcode/solved')
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

function Diagnostics() {
  const [dockerData, setDockerData] = useState<DockerData | null>(null);
  const [piholeData, setPiholeData] = useState<PiholeData | null>(null);
  const [diagnosticsData, setDiagnosticsData] =
    useState<DiangosticsData | null>(null);
  const [piholeHealth, setPiholeHealth] = useState<ServiceStatus>('loading');

  useEffect(() => {
    axios
      .get('http://192.168.0.69:81/api/diagnostics/')
      .then(({ data }) => {
        console.log(data);
        setDiagnosticsData(data);
      })
      .catch((error) => console.log(error));

    axios
      .get('http://192.168.0.69:81/api/pihole/summary/')
      .then(({ data }) => {
        console.log(data);
        setPiholeData(data);
      })
      .catch((error) => console.log(error));

    axios
      .get('http://192.168.0.69:81/api/pihole/')
      .then(({ data }) => {
        console.log(data);
        setPiholeHealth(data.status);
      })
      .catch((error) => console.log(error));

    axios
      .get('http://192.168.0.69:81/api/docker/stats/')
      .then((response) => {
        setDockerData(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <Box sx={{ marginTop: '8px' }}>
      <Grid container spacing={2}>
        <Grid xs={12} sm={3} md={2}>
          <Stack
            direction="column"
            // direction="row"
            justifyContent="flex-start"
            // alignItems="flex-start"
            alignItems="stretch"
            spacing={1}
          >
            <StatusChip label="Dashboard" status="ok" />
            <StatusChip
              label="API"
              status={diagnosticsData ? 'ok' : 'loading'}
            />
            <StatusChip label="Pihole" status={piholeHealth} />
            <StatusChip label="Traefik" status={'warning'} />
            <StatusChip label="Cache" status={'loading'} />
            <StatusChip label="Spotify API" status={'loading'} />
            <StatusChip label="Nest API" status={'loading'} />
            <StatusChip label="Weather Forecast" status={'loading'} />
          </Stack>
        </Grid>
        {/* <Box
          sx={{
            display: 'flex',
            // justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            marginY: '16px',
          }}
        >
          <StatusChip label="Pihole" status={piholeHealth} />
          <StatusChip label="API" status={diagnosticsData ? 'ok' : 'loading'} />
          <Chip color="warning" icon={<CheckCircleIcon />} label="Traefik" />
          <Chip color="error" icon={<CheckCircleIcon />} label="Dashboard" />
          <Chip disabled icon={<CheckCircleIcon />} label="Disabled" />
        </Box> */}
        <Grid container spacing={2} xs={12} sm={9} md={10}>
          {diagnosticsData && (
            <>
              <DiagnosticsCard
                title="CPU"
                // value1={diagnosticsData.cpu.percent
                //   .map((percent) => `${percent}%`)
                //   .join(', ')}
                values={[
                  `${Math.max(...diagnosticsData.cpu.percent).toFixed(2)}% max`,
                  `${(
                    diagnosticsData.cpu.percent.reduce((acc, c) => acc + c, 0) /
                    diagnosticsData.cpu.percent.length
                  ).toFixed(2)}% avg`,
                ]}
                icon={<MemoryIcon color="success" sx={{ fontSize: 48 }} />}
              />
              <DiagnosticsCard
                title="Memory"
                values={[`${diagnosticsData.memory.percent.toFixed(1)}%`]}
                icon={<MemoryIcon color="success" sx={{ fontSize: 48 }} />}
              />
              <DiagnosticsCard
                title="Disk"
                values={[`${diagnosticsData.disk.percent.toFixed(1)}%`]}
                icon={<SaveIcon color="success" sx={{ fontSize: 48 }} />}
              />
              <DiagnosticsCard
                title="Temperature"
                values={[
                  `${celsiusToFahrenheit(diagnosticsData.cpu.temp).toFixed(
                    1
                  )}°F`,
                ]}
                icon={
                  <DeviceThermostatOutlinedIcon
                    color="success"
                    sx={{ fontSize: 48 }}
                  />
                }
              />
            </>
          )}
          {piholeData && (
            <>
              <PiholeSummaryCard
                title="DNS Queries Today"
                value1={Number(piholeData.dns_queries_today).toLocaleString()}
                value2={`${piholeData.unique_clients} unique clients`}
                icon={<DnsIcon color="success" sx={{ fontSize: 48 }} />}
              />
              <PiholeSummaryCard
                title="Ads Blocked Today"
                value1={Number(piholeData.ads_blocked_today).toLocaleString()}
                value2={`${Number(piholeData.ads_percentage_today).toFixed(
                  2
                )}%`}
                icon={<AccessTimeIcon color="success" sx={{ fontSize: 48 }} />}
              />
              <PiholeSummaryCard
                title="Domains Being Blocked"
                value1={Number(
                  piholeData.domains_being_blocked
                ).toLocaleString()}
                value2={`Updated ${piholeData.gravity_last_updated.relative.days} days, ${piholeData.gravity_last_updated.relative.hours} hours, ${piholeData.gravity_last_updated.relative.minutes} minutes ago`}
                icon={<BlockIcon color="success" sx={{ fontSize: 48 }} />}
              />
            </>
          )}
        </Grid>
        <Grid xs={12}>
          <TableContainer component={Paper} sx={{ minWidth: 650 }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Container Name</TableCell>
                  {/* <TableCell>CPU Usage ()</TableCell> */}
                  <TableCell>CPU %</TableCell>
                  <TableCell>Memory Usage / Limit</TableCell>
                  {/* <TableCell>Memory Limit (GB)</TableCell> */}
                  <TableCell>Network I/O</TableCell>
                  {/* <TableCell>Network Out</TableCell> */}
                  <TableCell>Network Dropped</TableCell>
                  <TableCell>Block I/O</TableCell>
                  {/* <TableCell>Block Out</TableCell> */}
                  <TableCell>PIDs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dockerData &&
                  dockerData.containers.map((container) => (
                    <TableRow
                      key={container.name}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {container.name}
                      </TableCell>
                      {/* <TableCell>{container.cpu_usage}</TableCell> */}
                      <TableCell>
                        {(
                          (container.cpu_usage / dockerData.system_cpu_usage) *
                          100
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {`${bitsToMegabits(
                          container.memory_usage
                        )}Mb / ${bitsToGigabytes(container.memory_limit)}GB`}
                      </TableCell>
                      {/* <TableCell>
                      {bitsToGigabytes(container.memory_limit)}
                    </TableCell> */}
                      <TableCell>
                        {`${bitsToMegabits(
                          container.network_in
                        )}Mb / ${bitsToMegabits(container.network_out)}Mb`}
                      </TableCell>
                      {/* <TableCell>{bitsToMegabits(container.network_in)}</TableCell>
                <TableCell>{bitsToMegabits(container.network_out)}</TableCell> */}
                      <TableCell>
                        {bitsToMegabits(container.network_dropped)}
                      </TableCell>
                      <TableCell>
                        {`${bitsToMegabits(
                          container.block_in
                        )} / ${bitsToMegabits(container.block_out)}`}
                      </TableCell>
                      {/* <TableCell>{bitsToMegabits(container.block_out)}</TableCell> */}
                      <TableCell>{container.pids}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <LeetCodeSummaryCard />
        </Grid>
      </Grid>
      <List dense>
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Single-line item"
            // secondary={secondary ? 'Secondary text' : null}
            secondary="Secondary text"
          />
        </ListItem>
      </List>
    </Box>
  );
}

export default Diagnostics;
