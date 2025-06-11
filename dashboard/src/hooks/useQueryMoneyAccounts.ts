import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Account {
	id: string;
	syncDisabled: boolean;
	isHidden: boolean;
	isAsset: boolean;
	includeInNetWorth: boolean;
	type: {
		name: string;
		display: string;
	};
	displayName: string;
	displayBalance: number;
	signedBalance: number;
	updatedAt: string;
	icon: string;
	logoUrl: string;
	includeBalanceInNetWorth: boolean;
	institution?: {
		id: string;
		name: string;
	};
}

export interface AccountTypeSummary {
	type: {
		display: string;
		group: 'asset' | 'liability';
		name: string;
	};
	accounts: Account[];
	totalDisplayBalance: number;
}

export interface NetWorthSummaryData {
	data: {
		accountTypeSummaries: AccountTypeSummary[];
	};
}

const useQueryMoneyAccounts = () => {
	return useQuery({
		queryKey: ['NetWorthSummary'],
		refetchInterval: 1000 * 60 * 15, // 15 minutes
		queryFn: () =>
			axios
				.get<NetWorthSummaryData>(`/money/accounts/`)
				.then((res) => res.data),
	});
};

export default useQueryMoneyAccounts;
