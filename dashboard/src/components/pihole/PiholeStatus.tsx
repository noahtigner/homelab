import {
	DnsOutlined as DnsIcon,
	Block as BlockIcon,
	AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import PiholeSummaryCard, {
	PiholeSummaryCardError,
	PiholeSummaryCardLoading,
} from './PiholeStatusCard';

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

function PiholeStatus() {
	const { isPending, error, data } = useQuery({
		queryKey: ['piholeStats'],
		refetchInterval: 1000 * 60 * 2, // 2 minutes
		queryFn: () =>
			axios.get<PiholeData>(`/pihole/summary/`).then((res) => res.data),
	});

	if (isPending) {
		return (
			<>
				<PiholeSummaryCardLoading
					title="DNS Queries Today"
					icon={<DnsIcon color="success" sx={{ fontSize: 48 }} />}
				/>
				<PiholeSummaryCardLoading
					title="Ads Blocked Today"
					icon={
						<AccessTimeIcon color="success" sx={{ fontSize: 48 }} />
					}
				/>
				<PiholeSummaryCardLoading
					title="Domains Being Blocked"
					icon={<BlockIcon color="success" sx={{ fontSize: 48 }} />}
				/>
			</>
		);
	}

	if (error) {
		return (
			<>
				<PiholeSummaryCardError
					title="DNS Queries Today"
					icon={<DnsIcon color="success" sx={{ fontSize: 48 }} />}
					errorMessage="An unexpected error occurred"
				/>
				<PiholeSummaryCardError
					title="Ads Blocked Today"
					icon={
						<AccessTimeIcon color="success" sx={{ fontSize: 48 }} />
					}
					errorMessage="An unexpected error occurred"
				/>
				<PiholeSummaryCardError
					title="Domains Being Blocked"
					icon={<BlockIcon color="success" sx={{ fontSize: 48 }} />}
					errorMessage="An unexpected error occurred"
				/>
			</>
		);
	}

	return (
		<>
			<PiholeSummaryCard
				title="DNS Queries Today"
				value1={Number(data.dns_queries_today).toLocaleString()}
				value2={`${data.unique_clients} unique clients`}
				icon={<DnsIcon color="success" sx={{ fontSize: 48 }} />}
			/>
			<PiholeSummaryCard
				title="Ads Blocked Today"
				value1={Number(data.ads_blocked_today).toLocaleString()}
				value2={`${Number(data.ads_percentage_today).toFixed(2)}%`}
				icon={<AccessTimeIcon color="success" sx={{ fontSize: 48 }} />}
			/>
			<PiholeSummaryCard
				title="Domains Being Blocked"
				value1={Number(data.domains_being_blocked).toLocaleString()}
				value2={`Updated ${data.gravity_last_updated.relative.days} days, ${data.gravity_last_updated.relative.hours} hours, ${data.gravity_last_updated.relative.minutes} minutes ago`}
				icon={<BlockIcon color="success" sx={{ fontSize: 48 }} />}
			/>
		</>
	);
}

export default PiholeStatus;
