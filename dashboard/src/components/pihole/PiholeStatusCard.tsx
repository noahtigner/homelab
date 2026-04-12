import { type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function PiholeSummaryCardWrapper({
	title,
	icon,
	child1,
	child2,
}: {
	title: string;
	icon: ReactNode;
	child1: ReactNode;
	child2: ReactNode;
}) {
	return (
		<div className="col-span-12 sm:col-span-4">
			<Card>
				<CardContent>
					<div className="mb-1 flex min-w-0 items-center">
						<img
							src="/pihole.svg"
							alt=""
							height={20}
							width={20}
							className="mr-2 shrink-0"
						/>
						<a
							href={`http://${import.meta.env.VITE_SERVER_IP}/admin/`}
							target="_blank"
							rel="noreferrer"
							className="min-w-0 no-underline text-inherit hover:text-primary"
						>
							<h2 className="text-base leading-tight lg:text-xl">
								{title}
							</h2>
						</a>
					</div>
					<div className="flex grow items-center justify-between">
						{child1}
						{icon}
					</div>
					{child2}
				</CardContent>
			</Card>
		</div>
	);
}

function PiholeSummaryCard({
	title,
	value1,
	value2,
	icon,
}: {
	title: string;
	value1: string | number;
	value2: string | number;
	icon: ReactNode;
}) {
	return (
		<PiholeSummaryCardWrapper
			title={title}
			icon={icon}
			child1={<h3 className="mb-1 text-2xl lg:text-4xl">{value1}</h3>}
			child2={<h4 className="text-base">{value2}</h4>}
		/>
	);
}

function PiholeSummaryCardLoading({
	title,
	icon,
}: {
	title: string;
	icon: ReactNode;
}) {
	return (
		<PiholeSummaryCardWrapper
			title={title}
			icon={icon}
			child1={<Skeleton className="h-12 w-full" />}
			child2={<Skeleton className="h-5 w-3/4" />}
		/>
	);
}

function PiholeSummaryCardError({
	title,
	icon,
	errorMessage,
}: {
	title: string;
	icon: ReactNode;
	errorMessage: string;
}) {
	return (
		<PiholeSummaryCardWrapper
			title={title}
			icon={icon}
			child1={<Skeleton className="h-12 w-full" />}
			child2={<h4 className="mt-2.5 text-base">{errorMessage}</h4>}
		/>
	);
}

export default PiholeSummaryCard;
export { PiholeSummaryCardLoading, PiholeSummaryCardError };
