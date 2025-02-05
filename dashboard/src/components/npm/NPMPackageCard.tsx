import { useEffect, useState } from 'react';
import {
	useTheme,
	Typography,
	Link,
	IconButton,
	Box,
	Chip,
} from '@mui/material';
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	Tooltip,
	TooltipProps,
} from 'recharts';
import LinkIcon from '@mui/icons-material/Link';
import axios from 'axios';

import { StyledCard, StyledCardContent } from '../StyledCard';
import { DownloadOutlined as DownloadOutlinedIcon } from '@mui/icons-material';

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
	const { palette } = useTheme();

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
			sx={{
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'start',
				alignContent: 'start',
				listStyle: 'none',
				m: 0,
				marginTop: 1,
				p: 0,
				gap: 1,
			}}
			component="ul"
		>
			{chipData.map(({ label, value, href }) => (
				<li key={value ?? href}>
					<Chip
						size="small"
						label={
							<>
								{label}{' '}
								{href ? (
									<IconButton
										component={Link}
										href={href}
										target="_blank"
										rel="noopener"
										sx={{ padding: 0 }}
									>
										<LinkIcon />
									</IconButton>
								) : (
									<strong
										style={{
											color: palette.text.secondary,
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

function CustomTooltip({ active, payload }: TooltipProps<string, string>) {
	const theme = useTheme();
	if (active && payload && payload.length) {
		return (
			<div
				style={{
					backgroundColor: theme.palette.background.paper,
					color: theme.palette.text.primary,
					borderColor: theme.palette.divider,
					borderRadius: theme.shape.borderRadius,
					borderWidth: 1,
					borderStyle: 'solid',
					padding: theme.spacing(0.5),
					zIndex: 1,
				}}
			>
				<Typography variant="subtitle2">
					{payload[0].payload.day}
				</Typography>
				<Typography
					variant="subtitle1"
					style={{ color: theme.palette.success.main }}
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
	const theme = useTheme();

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					flexGrow: 1,
					justifyContent: 'space-between',
					marginBottom: theme.spacing(2),
				}}
			>
				<Typography
					sx={{
						fontSize: '2.5rem',
						marginBottom: theme.spacing(0.5),
					}}
					variant="h3"
				>
					{npmPackageInfo.downloads.total} / month
				</Typography>
				<DownloadOutlinedIcon color="success" sx={{ fontSize: 48 }} />
			</Box>
			<ResponsiveContainer
				width={'100%'}
				height="min-height"
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
						stroke={theme.palette.primary.main}
						fill={theme.palette.primary.dark}
					/>
					<Tooltip content={<CustomTooltip />} />
				</AreaChart>
			</ResponsiveContainer>
			<NPMChips npmPackageInfo={npmPackageInfo} />
		</>
	);
}

function NPMPackageCard({ packageName }: { packageName: string }) {
	const theme = useTheme();

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
		<StyledCard variant="outlined">
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					sx={{ marginBottom: theme.spacing(0.5) }}
				>
					<img
						src="https://static-production.npmjs.com/b0f1a8318363185cc2ea6a40ac23eeb2.png"
						alt="NPM"
						width={20}
						style={{ marginRight: theme.spacing(1) }}
					/>
					<Link
						href={npmPackageInfo?.homepage}
						target="_blank"
						rel="noreferrer"
						sx={{ textDecoration: 'none', color: 'inherit' }}
					>
						<Typography
							sx={{
								fontSize: '1.25rem',
							}}
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
