import { Divider } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import Attribution from '../components/Attribution';
import LeetCodeSummaryCard from '../components/leetcode/LeetCodeSummaryCard';
// import DockerTable from './components/docker/DockerTable';
import NPMPackageCard from '../components/npm/NPMPackageCard';
import GithubSummaryCard from '../components/github/GithubSummaryCard';
import PiholeStatus from '../components/pihole/PiholeStatus';
import { DiagnosticsGrid, StatusStack } from '../components/diagnostics';
import OGPPreview from '../components/portfolio/OGPPreview';
import InvestmentSummaryCard from '../components/money/InvestmentSummary';
import NetWorthSummaryCard from '../components/money/NetWorthSummary';

function Index() {
	return (
		<>
			<Grid container spacing={2}>
				<Grid xs={12} sm={3} md={2}>
					<StatusStack />
				</Grid>
				<Grid container spacing={2} xs={12} sm={9} md={10}>
					<DiagnosticsGrid />
					<PiholeStatus />
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
				<Grid xs={12} md={3}>
					<InvestmentSummaryCard />
				</Grid>
				<Grid xs={12} md={3}>
					<NetWorthSummaryCard />
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
