import { usePiholeHistory, usePiholeSummary } from '../../hooks/usePiholeData';
import PiholeDnsAdBlockingCard from './PiholeDnsAdBlockingCard';

function PiholeStatus() {
	const summary = usePiholeSummary();
	const history = usePiholeHistory();
	return (
		<PiholeDnsAdBlockingCard
			summary={summary.data}
			isSummaryPending={summary.isPending}
			history={history.data}
			isHistoryPending={history.isPending}
		/>
	);
}

export default PiholeStatus;
