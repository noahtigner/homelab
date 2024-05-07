import { Divider } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import Attribution from '../components/Attribution';
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

function Index() {
	return (
		<>
			<Grid container spacing={2}>
				<Grid xs={12} sm={3} md={2.5} lg={2} xl={1}>
					<StatusStackPihole />
				</Grid>
				<Grid xs={12} sm={3} md={2.5} lg={2} xl={1}>
					<StatusStackPrimary />
				</Grid>
				<Grid xs={12} sm={6} md={7} lg={8} xl={10}>
					<DashboardTable />
				</Grid>
				{/* <Grid container spacing={2} xs={12} sm={9} md={10}>
					<DiagnosticsGrid client={piholeClient} />
					<DiagnosticsGrid client={servicesClient} />
				</Grid> */}
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
			<Divider sx={{ paddingY: 1 }}>Attribution</Divider>
			<Attribution />
		</>
	);
}

export default Index;
