import Grid from '@mui/material/Unstable_Grid2';

import LeetCodeSummaryCard from '../components/leetcode/LeetCodeSummaryCard';
// import DockerTable from './components/docker/DockerTable';
import NPMPackageCard from '../components/npm/NPMPackageCard';
import GithubSummaryCard from '../components/github/GithubSummaryCard';
import PiholeStatus from '../components/pihole/PiholeStatus';
import {
	StatusStackPrimary,
	StatusStackPihole,
} from '../components/diagnostics/StatusStack';
import OGPPreview from '../components/portfolio/OGPPreview';
import InvestmentSummaryCard from '../components/money/InvestmentSummary';
import NetWorthSummaryCard from '../components/money/NetWorthSummary';
import ActiveUsersPerDayCard from '../components/analytics/ActiveUsersPerDayCard';
import DashboardTable from '../components/diagnostics/DiagnosticsTable';
import SpeedTestSummaryCard from '../components/speedtest/SpeedTestSummary';

function Index() {
	return (
		<Grid container spacing={2}>
			<Grid xs={12} sm={6} md={2.5} lg={2}>
				<StatusStackPihole />
			</Grid>
			<Grid xs={12} sm={6} md={2.5} lg={2}>
				<StatusStackPrimary />
			</Grid>
			<Grid container spacing={2} xs={12} md={7} lg={8}>
				<Grid xs={12}>
					<DashboardTable />
				</Grid>
				<Grid xs={12}>
					<SpeedTestSummaryCard />
				</Grid>
			</Grid>
			<Grid container spacing={2} xs={12}>
				<PiholeStatus />
			</Grid>
			<Grid xs={12} md={3}>
				<InvestmentSummaryCard />
			</Grid>
			<Grid xs={12} md={3}>
				<NetWorthSummaryCard />
			</Grid>
			<Grid xs={12} md={6}>
				<ActiveUsersPerDayCard />
			</Grid>
			<Grid xs={12} sm={6} lg={4}>
				<LeetCodeSummaryCard />
			</Grid>
			<Grid xs={12} sm={6} lg={4}>
				<NPMPackageCard packageName="validate-env-vars" />
			</Grid>
			<Grid xs={12} sm={6} lg={4}>
				<GithubSummaryCard />
			</Grid>
			<Grid xs={12}>
				<OGPPreview url="https://noahtigner.com/" />
			</Grid>
			{/* <Grid xs={12}>
				<DockerTable />
			</Grid> */}
		</Grid>
	);
}

export default Index;
