import { Download, Link as LinkIcon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import type { z } from 'zod';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNpmPackage } from '@/hooks/useNpmPackage';
import type { npmPackageInfoSchema } from '@/types/schemas';

type NPMPackageInfo = z.infer<typeof npmPackageInfoSchema>;

function NPMChips({ npmPackageInfo }: { npmPackageInfo: NPMPackageInfo }) {
	const chipData = [
		{
			label: 'Version',
			value: npmPackageInfo.version,
		},
		{
			label: 'Issues',
			href: npmPackageInfo.issues,
		},
		{
			label: 'Pulls',
			href: npmPackageInfo.pulls,
		},
	];

	return (
		<ul className="mt-2 flex list-none flex-wrap items-start justify-start gap-2 p-0">
			{chipData.map(({ label, value, href }) => (
				<li key={value ?? href}>
					<Badge variant="secondary">
						{label}{' '}
						{href ? (
							<a
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center text-inherit hover:text-primary"
							>
								<LinkIcon size={14} />
							</a>
						) : (
							<strong className="text-muted-foreground">
								({value})
							</strong>
						)}
					</Badge>
				</li>
			))}
		</ul>
	);
}

function CustomTooltip({ active, payload }: TooltipContentProps) {
	if (active && payload && payload.length) {
		const point = payload[0].payload as { day: string };
		return (
			<div className="z-10 rounded border border-border bg-card p-1 text-card-foreground">
				<p className="text-xs font-medium">{point.day}</p>
				<p className="text-sm text-success-foreground">
					downloads: {payload[0].value}
				</p>
			</div>
		);
	}

	return null;
}

function NPMPackageSummary({
	npmPackageInfo,
}: {
	npmPackageInfo: NPMPackageInfo;
}) {
	return (
		<>
			<div className="mb-2 flex grow justify-between">
				<h3 className="text-2xl">
					{npmPackageInfo.downloads.total} / month
				</h3>
				<Download className="size-8 text-success-foreground" />
			</div>
			<div className="mt-auto">
				<ResponsiveContainer
					width="100%"
					aspect={8}
					style={{ zIndex: 50 }}
				>
					<AreaChart
						data={npmPackageInfo.downloads.per_day}
						margin={{ top: 0, right: 0, bottom: 2, left: 0 }}
					>
						<Area
							type="monotone"
							dataKey="downloads"
							stroke="var(--color-primary)"
							fill="var(--color-primary)"
							fillOpacity={0.2}
						/>
						<Tooltip content={CustomTooltip} />
					</AreaChart>
				</ResponsiveContainer>
				<NPMChips npmPackageInfo={npmPackageInfo} />
			</div>
		</>
	);
}

function NPMPackageCardContent({ packageName }: { packageName: string }) {
	const { isLoading, isError, data } = useNpmPackage(packageName);

	if (isError) {
		return (
			<p className="py-2 text-destructive-foreground">
				Failed to load NPM package data
			</p>
		);
	}

	if (isLoading || !data) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-10 w-48" />
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-6 w-64" />
			</div>
		);
	}

	return <NPMPackageSummary npmPackageInfo={data} />;
}

function NPMPackageCard({ packageName }: { packageName: string }) {
	return (
		<Card>
			<CardContent className="flex grow flex-col">
				<div className="mb-1 flex items-center">
					<img
						src="https://static-production.npmjs.com/b0f1a8318363185cc2ea6a40ac23eeb2.png"
						alt="NPM"
						width={20}
						className="mr-2"
					/>
					<a
						href={`https://www.npmjs.com/package/${packageName}`}
						target="_blank"
						rel="noreferrer"
						className="no-underline text-inherit hover:text-primary"
					>
						<h2 className="text-xl">{packageName}</h2>
					</a>
				</div>
				<NPMPackageCardContent packageName={packageName} />
			</CardContent>
		</Card>
	);
}

export default NPMPackageCard;
