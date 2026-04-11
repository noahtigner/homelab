import { Globe, ShieldBan, Clock } from 'lucide-react';

import PiholeSummaryCard, {
	PiholeSummaryCardError,
	PiholeSummaryCardLoading,
} from './PiholeStatusCard';
import { usePiholeSummary } from '../../hooks/usePiholeData';

const iconClass = 'size-8 lg:size-12 text-success-foreground shrink-0';

function PiholeStatus() {
	const { isPending, error, data } = usePiholeSummary();

	if (isPending) {
		return (
			<>
				<PiholeSummaryCardLoading
					title="DNS Queries Today"
					icon={<Globe className={iconClass} />}
				/>
				<PiholeSummaryCardLoading
					title="Ads Blocked Today"
					icon={<Clock className={iconClass} />}
				/>
				<PiholeSummaryCardLoading
					title="Domains Being Blocked"
					icon={<ShieldBan className={iconClass} />}
				/>
			</>
		);
	}

	if (error) {
		return (
			<>
				<PiholeSummaryCardError
					title="DNS Queries Today"
					icon={<Globe className={iconClass} />}
					errorMessage="An unexpected error occurred"
				/>
				<PiholeSummaryCardError
					title="Ads Blocked Today"
					icon={<Clock className={iconClass} />}
					errorMessage="An unexpected error occurred"
				/>
				<PiholeSummaryCardError
					title="Domains Being Blocked"
					icon={<ShieldBan className={iconClass} />}
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
				icon={<Globe className={iconClass} />}
			/>
			<PiholeSummaryCard
				title="Ads Blocked Today"
				value1={Number(data.sum_blocked).toLocaleString()}
				value2={`${Number(data.percent_blocked).toFixed(2)}% blocked`}
				icon={<Clock className={iconClass} />}
			/>
			<PiholeSummaryCard
				title="Domains Being Blocked"
				value1={Number(data.gravity).toLocaleString()}
				value2={`${data.total_clients} unique clients`}
				icon={<ShieldBan className={iconClass} />}
			/>
		</>
	);
}

export default PiholeStatus;
