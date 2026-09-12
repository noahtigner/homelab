import LeetCodeSummaryCard from '@/components/leetcode/LeetCodeSummaryCard';
// import DockerTable from '@/components/docker/DockerTable';
import NPMPackageCard from '@/components/npm/NPMPackageCard';
import GithubSummaryCard from '@/components/github/GithubSummaryCard';
import PiholeStatus from '@/components/pihole/PiholeStatus';
import { StatusStackPrimary } from '@/components/diagnostics/StatusStack';
import OGPPreview from '@/components/portfolio/OGPPreview';
import NetWorthSummaryCard from '@/components/money/NetWorthSummary';
import ActiveUsersPerDayCard from '@/components/analytics/ActiveUsersPerDayCard';
import DashboardTable from '@/components/diagnostics/DiagnosticsTable';
// import SpeedTestSummaryCard from '@/components/speedtest/SpeedTestSummary';
import NasStorageCard from '@/components/diagnostics/NasStorageCard';
import PlexMediaLibraryCard from '@/components/plex/PlexMediaLibraryCard';
import PlexActiveSessionsCard from '@/components/plex/PlexActiveSessionsCard';

function Index() {
	return (
		<div className="grid grid-cols-12 gap-2 sm:gap-3">
			<h1 className="sr-only">Homelab Dashboard</h1>

			<div className="col-span-12 md:col-span-3">
				<StatusStackPrimary />
			</div>
			<div className="col-span-12 md:col-span-9">
				<div className="grid grid-cols-12 gap-2 sm:gap-3">
					<div className="col-span-12">
						<DashboardTable />
					</div>
					<PiholeStatus />
				</div>
			</div>

			<div className="col-span-12 sm:col-span-6 md:col-span-4">
				<NasStorageCard />
			</div>
			<div className="col-span-12 sm:col-span-6 md:col-span-4">
				<PlexMediaLibraryCard />
			</div>
			<div className="col-span-12 sm:col-span-6 md:col-span-4">
				<PlexActiveSessionsCard />
			</div>

			<div className="col-span-12">
				<NetWorthSummaryCard />
			</div>

			<div className="col-span-12 sm:col-span-6 lg:col-span-4">
				<ActiveUsersPerDayCard />
			</div>
			<div className="col-span-12 sm:col-span-6 lg:col-span-4">
				<LeetCodeSummaryCard />
			</div>
			<div className="col-span-12 sm:col-span-6 lg:col-span-4">
				<NPMPackageCard packageName="validate-env-vars" />
			</div>
			<div className="col-span-12 sm:col-span-6 lg:col-span-4">
				<GithubSummaryCard />
			</div>
			<div className="col-span-12 sm:col-span-6 lg:col-span-4">
				<OGPPreview url="https://noahtigner.com/" />
			</div>
		</div>
	);
}

export default Index;
