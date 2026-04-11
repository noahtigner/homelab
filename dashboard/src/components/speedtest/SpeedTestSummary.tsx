import { type ReactNode } from 'react';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSpeedTest } from '../../hooks/useSpeedTest';
import type { z } from 'zod';
import type { speedTestSchema } from '../../types/schemas';

type SpeedTestModel = z.infer<typeof speedTestSchema>;

const bytesToMegabits = (bytes: number): number => {
	const megabits = bytes / 1e6;
	return Math.round(megabits * 100) / 100;
};

const getTestElapsedTime = (timestamp: string): number => {
	const testDate = new Date(timestamp).getTime();
	const currentDate = new Date().getTime();

	const diffInMilliseconds = currentDate - testDate;
	const diffInMinutes = Math.floor(diffInMilliseconds / 1000 / 60);
	return diffInMinutes;
};

function SpeedTestItem({ icon, text }: { icon: ReactNode; text: string }) {
	return (
		<div className="flex grow items-center gap-2">
			{icon}
			{text}
		</div>
	);
}

function SpeedTestSummaryInner({ data }: { data: SpeedTestModel }) {
	return (
		<div className="flex justify-between gap-1">
			<div>
				<SpeedTestItem
					icon={<RefreshCw size={20} />}
					text={data.ping.toString()}
				/>
				<SpeedTestItem
					icon={<ArrowDownCircle size={20} />}
					text={`${bytesToMegabits(data.download)} Mbps`}
				/>
				<SpeedTestItem
					icon={<ArrowUpCircle size={20} />}
					text={`${bytesToMegabits(data.upload)} Mbps`}
				/>
			</div>
			<p className="text-right">
				last tested {getTestElapsedTime(data.timestamp)} minutes ago
				<br />
				{data.client.ip}
				<br />
				{data.client.isp}, {data.client.country}
			</p>
		</div>
	);
}

function SpeedTestSummary() {
	const { isPending, error, data } = useSpeedTest();

	if (isPending) {
		return (
			<div>
				<Skeleton className="mb-2 h-6 w-full" />
				<Skeleton className="h-5 w-full" />
			</div>
		);
	}
	if (error) {
		return (
			<div>
				<h2 className="mb-2 text-xl">An unexpected error occurred</h2>
				<h3 className="break-words text-base">{error.message}</h3>
			</div>
		);
	}
	return <SpeedTestSummaryInner data={data} />;
}

function SpeedTestSummaryCard() {
	return (
		<Card>
			<CardContent>
				<div className="mb-1 flex items-center">
					<img
						src="https://www.speedtest.net/favicon.ico"
						alt="SpeedTest"
						width={24}
						className="mr-2"
					/>
					<a
						href="https://www.speedtest.net/"
						target="_blank"
						rel="noreferrer"
						className="no-underline text-inherit hover:text-primary"
					>
						<h2 className="text-xl">SpeedTest</h2>
					</a>
				</div>
				<SpeedTestSummary />
			</CardContent>
		</Card>
	);
}

export default SpeedTestSummaryCard;
