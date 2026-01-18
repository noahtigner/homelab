import { DnsIcon, BlockIcon, AccessTimeIcon } from '../icons';

import PiholeSummaryCard, {
	PiholeSummaryCardError,
	PiholeSummaryCardLoading,
} from './PiholeStatusCard';
import { usePiholeSummary } from '../../hooks/usePiholeData';

function PiholeStatus() {
	const { isPending, error, data } = usePiholeSummary();

	if (isPending) {
		return (
			<>
				<PiholeSummaryCardLoading
					title="DNS Queries Today"
					icon={<DnsIcon color="success" fontSize={48} />}
				/>
				<PiholeSummaryCardLoading
					title="Ads Blocked Today"
					icon={<AccessTimeIcon color="success" fontSize={48} />}
				/>
				<PiholeSummaryCardLoading
					title="Domains Being Blocked"
					icon={<BlockIcon color="success" fontSize={48} />}
				/>
			</>
		);
	}

	if (error) {
		return (
			<>
				<PiholeSummaryCardError
					title="DNS Queries Today"
					icon={<DnsIcon color="success" fontSize={48} />}
					errorMessage="An unexpected error occurred"
				/>
				<PiholeSummaryCardError
					title="Ads Blocked Today"
					icon={<AccessTimeIcon color="success" fontSize={48} />}
					errorMessage="An unexpected error occurred"
				/>
				<PiholeSummaryCardError
					title="Domains Being Blocked"
					icon={<BlockIcon color="success" fontSize={48} />}
					errorMessage="An unexpected error occurred"
				/>
			</>
		);
	}

	return (
		<>
			<PiholeSummaryCard
				title="DNS Queries Today"
				value1={Number(data.sum_queries).toLocaleString()}
				value2={`${data.qps.toFixed(1)} queries per second`}
				icon={<DnsIcon color="success" fontSize={48} />}
			/>
			<PiholeSummaryCard
				title="Ads Blocked Today"
				value1={Number(data.sum_blocked).toLocaleString()}
				value2={`${Number(data.percent_blocked).toFixed(2)}% blocked`}
				icon={<AccessTimeIcon color="success" fontSize={48} />}
			/>
			<PiholeSummaryCard
				title="Domains Being Blocked"
				value1={Number(data.gravity).toLocaleString()}
				value2={`${data.total_clients} unique clients`}
				icon={<BlockIcon color="success" fontSize={48} />}
			/>
		</>
	);
}

export default PiholeStatus;
