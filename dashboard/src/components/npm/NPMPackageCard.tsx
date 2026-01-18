import { useEffect, useState } from 'react';
import { Box, Chip, Link, Typography } from '../ui';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { LinkIcon, DownloadIcon } from '../icons';
import axios from 'axios';

import { StyledCard, StyledCardContent } from '../StyledCard';

interface NPMDownloadsDay {
	downloads: number;
	day: string;
}

interface NPMDownloads {
	total?: number;
	per_day: NPMDownloadsDay[];
	start?: string;
	end?: string;
}

interface NPMPackageInfo {
	name: string;
	version: string;
	description: string;
	license: string;
	homepage: string;
	repository: string;
	issues: string;
	pulls: string;
	downloads: NPMDownloads;
}

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
		<Box
			component="ul"
			display="flex"
			flexWrap="wrap"
			justifyContent="flex-start"
			alignItems="flex-start"
			gap={1}
			style={{
				listStyle: 'none',
				margin: 0,
				marginTop: 'calc(var(--spacing-unit) * 1)',
				padding: 0,
			}}
		>
			{chipData.map(({ label, value, href }) => (
				<li key={value ?? href}>
					<Chip
						size="small"
						label={
							<>
								{label}{' '}
								{href ? (
									<Link
										href={href}
										target="_blank"
										rel="noopener"
										style={{ padding: 0 }}
									>
										<LinkIcon />
									</Link>
								) : (
									<strong
										style={{
											color: 'var(--color-text-secondary)',
										}}
									>
										({value})
									</strong>
								)}
							</>
						}
					/>
				</li>
			))}
		</Box>
	);
}

function CustomTooltip({
	active,
	payload,
}: TooltipContentProps<string, string>) {
	if (active && payload && payload.length) {
		return (
			<div
				style={{
					backgroundColor: 'var(--color-paper)',
					color: 'var(--color-text-primary)',
					borderColor: 'var(--color-divider)',
					borderRadius: 'var(--border-radius-lg)',
					borderWidth: 1,
					borderStyle: 'solid',
					padding: 'calc(var(--spacing-unit) * 0.5)',
					zIndex: 1,
				}}
			>
				<Typography variant="subtitle2">
					{payload[0].payload.day}
				</Typography>
				<Typography
					variant="subtitle1"
					style={{ color: 'var(--color-success-text)' }}
				>
					downloads: {payload[0].value}
				</Typography>
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
			<Box
				display="flex"
				flexGrow={1}
				justifyContent="space-between"
				style={{ marginBottom: 'calc(var(--spacing-unit) * 2)' }}
			>
				<Typography
					style={{
						fontSize: '2.5rem',
						marginBottom: 'calc(var(--spacing-unit) * 0.5)',
					}}
					variant="h3"
				>
					{npmPackageInfo.downloads.total} / month
				</Typography>
				<DownloadIcon color="success" fontSize={48} />
			</Box>
			<ResponsiveContainer
				width={'100%'}
				aspect={8}
				style={{ zIndex: 50 }}
			>
				<AreaChart
					data={npmPackageInfo.downloads.per_day}
					margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
				>
					<Area
						type="monotone"
						dataKey="downloads"
						stroke="var(--color-primary)"
						fill="var(--color-primary-dark)"
					/>
					<Tooltip content={CustomTooltip} />
				</AreaChart>
			</ResponsiveContainer>
			<NPMChips npmPackageInfo={npmPackageInfo} />
		</>
	);
}

function NPMPackageCard({ packageName }: { packageName: string }) {
	const [npmPackageInfo, setNPMPackageInfo] = useState<NPMPackageInfo | null>(
		null
	);

	useEffect(() => {
		axios
			.get(`${import.meta.env.VITE_API_BASE}/npm/${packageName}/`)
			.then(({ data }) => {
				setNPMPackageInfo(data);
			})
			.catch((error) => console.error(error));
	}, [packageName]);

	return (
		<StyledCard>
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					style={{ marginBottom: 'calc(var(--spacing-unit) * 0.5)' }}
				>
					<img
						src="https://static-production.npmjs.com/b0f1a8318363185cc2ea6a40ac23eeb2.png"
						alt="NPM"
						width={20}
						style={{ marginRight: 'calc(var(--spacing-unit) * 1)' }}
					/>
					<Link
						href={npmPackageInfo?.homepage}
						target="_blank"
						rel="noreferrer"
						style={{ textDecoration: 'none', color: 'inherit' }}
					>
						<Typography
							style={{ fontSize: '1.25rem' }}
							variant="h2"
						>
							{packageName}
						</Typography>
					</Link>
				</Box>
				{npmPackageInfo && (
					<NPMPackageSummary npmPackageInfo={npmPackageInfo} />
				)}
			</StyledCardContent>
		</StyledCard>
	);
}

export default NPMPackageCard;
