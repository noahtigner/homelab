import { type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function DiagnosticsCard({
	title,
	values,
	icon,
	loading = false,
}: {
	title: string;
	values: string[];
	icon: ReactNode;
	loading?: boolean;
}) {
	return (
		<Card>
			<CardContent>
				<h2 className="mb-1 text-xl font-light">{title}</h2>
				<div className="flex grow items-center justify-between">
					<div>
						{loading ? (
							<Skeleton className="h-9 w-[100px]" />
						) : (
							values.map((v) => (
								<h3
									key={v}
									className={
										values.length > 1
											? 'text-xs break-words'
											: 'text-3xl break-words'
									}
								>
									{v}
								</h3>
							))
						)}
					</div>
					{icon}
				</div>
			</CardContent>
		</Card>
	);
}

export default DiagnosticsCard;
