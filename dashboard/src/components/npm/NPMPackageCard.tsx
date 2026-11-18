import { Download, Link as LinkIcon } from 'lucide-react';
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	Tooltip,
	YAxis,
	CartesianGrid,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import type { z } from 'zod';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNpmPackage } from '@/hooks/useNpmPackage';
import type { npmPackageInfoSchema } from '@/types/schemas';

type NPMPackageInfo = z.infer<typeof npmPackageInfoSchema>;

const countFormatter = new Intl.NumberFormat('en-US', {
	notation: 'compact',
	maximumFractionDigits: 1,
});

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
			<div className="flex justify-between">
				<h3 className="text-2xl">
					{npmPackageInfo.downloads.total} / month
				</h3>
				<Download className="size-8 text-success-foreground" />
			</div>
			<div
				className="relative mt-2 min-h-[120px] min-w-0 flex-1"
				role="img"
				aria-label={`Daily downloads for ${npmPackageInfo.name}`}
			>
				<div className="absolute inset-0">
					<ResponsiveContainer
						width="100%"
						height="100%"
						minWidth={0}
					>
						<AreaChart
							data={npmPackageInfo.downloads.per_day}
							margin={{ top: 8, right: 4, bottom: 8, left: 0 }}
							accessibilityLayer
						>
							<CartesianGrid
								vertical={false}
								stroke="var(--border)"
							/>
							<YAxis
								domain={[0, 'auto']}
								allowDecimals={false}
								tickCount={4}
								interval={0}
								width={44}
								tickFormatter={(value: number) =>
									countFormatter.format(value)
								}
								tick={{
									fill: 'var(--muted-foreground)',
									fontSize: 11,
								}}
								tickLine={false}
								axisLine={false}
							/>
							<Area
								type="monotone"
								dataKey="downloads"
								stroke="var(--primary)"
								fill="var(--primary)"
								fillOpacity={0.2}
								isAnimationActive={false}
							/>
							<Tooltip content={CustomTooltip} />
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>
			<NPMChips npmPackageInfo={npmPackageInfo} />
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
			<div className="flex flex-1 flex-col gap-2">
				<Skeleton className="h-10 w-48" />
				<Skeleton className="min-h-[120px] w-full flex-1" />
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
