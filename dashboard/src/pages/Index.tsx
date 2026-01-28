import Grid from '@mui/material/Grid';

import LeetCodeSummaryCard from '../components/leetcode/LeetCodeSummaryCard';
// import DockerTable from './components/docker/DockerTable';
import NPMPackageCard from '../components/npm/NPMPackageCard';
import GithubSummaryCard from '../components/github/GithubSummaryCard';
import PiholeStatus from '../components/pihole/PiholeStatus';
import { StatusStackPrimary } from '../components/diagnostics/StatusStack';
import OGPPreview from '../components/portfolio/OGPPreview';
import InvestmentSummaryCard from '../components/money/InvestmentSummary';
import NetWorthSummaryCard from '../components/money/NetWorthSummary';
import EquitySummaryCard from '../components/money/EquitySummary';
import ActiveUsersPerDayCard from '../components/analytics/ActiveUsersPerDayCard';
import DashboardTable from '../components/diagnostics/DiagnosticsTable';
// import SpeedTestSummaryCard from '../components/speedtest/SpeedTestSummary';
import NasStorageCard from '../components/diagnostics/NasStorageCard';
import PlexMediaLibraryCard from '../components/plex/PlexMediaLibraryCard';
import PlexActiveSessionsCard from '../components/plex/PlexActiveSessionsCard';

function Index() {
	return (
		<Grid container spacing={2}>
			<Grid size={{ xs: 12, md: 2, lg: 3 }}>
				<StatusStackPrimary />
			</Grid>
			<Grid container spacing={2} size={{ xs: 12, md: 10, lg: 9 }}>
				<Grid size={12}>
					<DashboardTable />
				</Grid>
				{/* <Grid size={12}>
					<SpeedTestSummaryCard />
				</Grid> */}
				<Grid container spacing={2} size={12}>
					<PiholeStatus />
				</Grid>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, lg: 4 }}>
				<NasStorageCard />
			</Grid>
			<Grid size={{ xs: 12, sm: 6, lg: 4 }}>
				<PlexMediaLibraryCard />
			</Grid>
			<Grid size={{ xs: 12, sm: 6, lg: 4 }}>
				<PlexActiveSessionsCard />
			</Grid>
			<Grid size={{ xs: 12, md: 3, lg: 2 }}>
				<InvestmentSummaryCard />
			</Grid>
			<Grid size={{ xs: 12, md: 3, lg: 2 }}>
				<EquitySummaryCard />
			</Grid>
			<Grid size={{ xs: 12, md: 4 }}>
				<NetWorthSummaryCard />
			</Grid>
			<Grid size={{ xs: 12, md: 6, lg: 4 }}>
				<ActiveUsersPerDayCard />
			</Grid>
			<Grid size={{ xs: 12, sm: 6, lg: 4 }}>
				<LeetCodeSummaryCard />
			</Grid>
			<Grid size={{ xs: 12, sm: 6, lg: 4 }}>
				<NPMPackageCard packageName="validate-env-vars" />
			</Grid>
			<Grid size={{ xs: 12, sm: 6, lg: 4 }}>
				<GithubSummaryCard />
			</Grid>
			<Grid size={12}>
				<OGPPreview url="https://noahtigner.com/" />
			</Grid>
			{/* <Grid size={12}>
				<DockerTable />
			</Grid> */}
		</Grid>
	);
}

export default Index;
