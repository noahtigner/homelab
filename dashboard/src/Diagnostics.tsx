import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, styled, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      // transform: 'scale(1.025)',
      transform: 'translateY(-8px)',
    },
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  margin: theme.spacing(1),
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

function PiholeSummaryCard({
  title,
  value1,
  value2,
}: {
  title: string;
  value1: string | number;
  value2: string | number;
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
          <Typography
            sx={{ fontSize: '2.5rem', marginBottom: theme.spacing(0.5) }}
            variant="h3"
          >
            {value1}
          </Typography>
          <Typography
            sx={{ fontSize: '1rem', marginBottom: theme.spacing(0.5) }}
            variant="h4"
          >
            {value2}
          </Typography>
        </StyledCardContent>
      </StyledCard>
    </Grid>
  );
}

function Diagnostics() {
  const [data, setData] = useState(null);
  const [lc, setLc] = useState(null);
  const [piholeData, setPiholeData] = useState<PiholeData | null>(null);

  useEffect(() => {
    fetch('http://192.168.0.69:81/api/diagnostics/')
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch((error) => console.log(error));

    axios
      .get('http://192.168.0.69:81/api/pihole/summary/')
      .then(({ data }) => {
        console.log(data);
        setPiholeData(data);
      })
      .catch((error) => console.log(error));

    axios
      .post('https://leetcode.com/graphql/', {
        query:
          '\n    query userPublicProfile($username: String!) {\n  matchedUser(username: $username) {\n    contestBadge {\n      name\n      expired\n      hoverText\n      icon\n    }\n    username\n    githubUrl\n    twitterUrl\n    linkedinUrl\n    profile {\n      ranking\n      userAvatar\n      realName\n      aboutMe\n      school\n      websites\n      countryName\n      company\n      jobTitle\n      skillTags\n      postViewCount\n      postViewCountDiff\n      reputation\n      reputationDiff\n      solutionCount\n      solutionCountDiff\n      categoryDiscussCount\n      categoryDiscussCountDiff\n    }\n  }\n}\n    ',
        variables: {
          username: 'noahtigner',
        },
        operationName: 'userPublicProfile',
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => console.log(error));

    axios
      .get('https://leetcode-stats-api.herokuapp.com/noahtigner')
      .then((response) => {
        setLc(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div>
      <Grid container spacing={2}>
        {piholeData && (
          <>
            <PiholeSummaryCard
              title="DNS Queries Today"
              value1={Number(piholeData.dns_queries_today).toLocaleString()}
              value2={`${piholeData.unique_clients} unique clients`}
            />
            <PiholeSummaryCard
              title="Ads Blocked Today"
              value1={Number(piholeData.ads_blocked_today).toLocaleString()}
              value2={`${Number(piholeData.ads_percentage_today).toFixed(2)}%`}
            />
            <PiholeSummaryCard
              title="Domains Being Blocked"
              value1={Number(piholeData.domains_being_blocked).toLocaleString()}
              value2={`Updated ${piholeData.gravity_last_updated.relative.days} days, ${piholeData.gravity_last_updated.relative.hours} hours, ${piholeData.gravity_last_updated.relative.minutes} minutes ago`}
            />
          </>
        )}
      </Grid>
      <pre>{JSON.stringify(data, null, 4)}</pre>
      <pre>{JSON.stringify(lc, null, 4)}</pre>
    </div>
  );
}

export default Diagnostics;
