import { useEffect, useState } from 'react';
import {
	DnsOutlined as DnsIcon,
	Block as BlockIcon,
	AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import axios from 'axios';
import type { RequestData } from '../../types';
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
	const [piholeData, setPiholeData] = useState<RequestData<PiholeData>>({
		status: 'loading',
	});

	useEffect(() => {
		axios
			.get(`${import.meta.env.VITE_API_BASE}/pihole/summary/`)
			.then(({ data }) => {
				console.log(data);
				setPiholeData({
					status: 'ok',
					data: data,
				});
			})
			.catch((error) => {
				console.log(error);
				setPiholeData({
					status: 'error',
					errorMessage: error.message,
				});
			});
	}, []);

	if (piholeData.status === 'loading') {
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

	if (piholeData.status === 'error') {
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
				value1={Number(
					piholeData.data.dns_queries_today
				).toLocaleString()}
				value2={`${piholeData.data.unique_clients} unique clients`}
				icon={<DnsIcon color="success" sx={{ fontSize: 48 }} />}
			/>
			<PiholeSummaryCard
				title="Ads Blocked Today"
				value1={Number(
					piholeData.data.ads_blocked_today
				).toLocaleString()}
				value2={`${Number(piholeData.data.ads_percentage_today).toFixed(
					2
				)}%`}
				icon={<AccessTimeIcon color="success" sx={{ fontSize: 48 }} />}
			/>
			<PiholeSummaryCard
				title="Domains Being Blocked"
				value1={Number(
					piholeData.data.domains_being_blocked
				).toLocaleString()}
				value2={`Updated ${piholeData.data.gravity_last_updated.relative.days} days, ${piholeData.data.gravity_last_updated.relative.hours} hours, ${piholeData.data.gravity_last_updated.relative.minutes} minutes ago`}
				icon={<BlockIcon color="success" sx={{ fontSize: 48 }} />}
			/>
		</>
	);
}

export default PiholeStatus;
