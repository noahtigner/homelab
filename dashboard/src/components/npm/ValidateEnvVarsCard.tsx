import { useEffect, useState } from 'react';
import {
	useTheme,
	Typography,
	Link,
	IconButton,
	Box,
	Chip,
} from '@mui/material';
// import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
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
				<li key={value}>
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

function NPMPackageSummary({
	npmPackageInfo,
}: {
	npmPackageInfo: NPMPackageInfo;
}) {
	const theme = useTheme();

	return (
		<>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
					<DownloadOutlinedIcon
						color="success"
						sx={{ fontSize: 48 }}
					/>
				</Box>
				{/* <LineChart
				width={600}
				height={300}
				data={npmPackageInfo.downloads.per_day.map((downloadDay) => ({
					day: downloadDay.day,
					downloads: downloadDay.downloads,
				}))}
				margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
			>
				<Line type="monotone" dataKey="uv" stroke="#8884d8" />
				<CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
				<XAxis dataKey="name" />
				<YAxis />
			</LineChart> */}
			</Box>
			<NPMChips npmPackageInfo={npmPackageInfo} />
		</>
	);
}

function NPMPackageCard({ packageName }: { packageName: string }) {
	const theme = useTheme();

	// const [leetCodeData, setLeetCodeData] = useState<LeetCodeSolvedData | null>(
	// 	null
	// );

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
				<Box display="flex" alignItems="start">
					{/* <Link
						href="https://www.npmjs.com/package/validate-env-vars"
						target="_blank"
						rel="noopener"
					/> */}
					<Typography
						sx={{
							fontSize: '1.25rem',
							marginBottom: theme.spacing(0.5),
						}}
						variant="h2"
					>
						Validate-Env-Vars
					</Typography>
					<IconButton
						component={Link}
						href="https://www.npmjs.com/package/validate-env-vars"
						target="_blank"
						// rel="noopener"
						sx={{ padding: 0, marginLeft: theme.spacing(0.5) }}
					>
						<LinkIcon />
					</IconButton>
				</Box>
				{/* {leetCodeData && (
					<LeetCodeSummary leetCodeData={leetCodeData} />
				)}
				<LeetCodeLanguageChips /> */}
				{npmPackageInfo && (
					<NPMPackageSummary npmPackageInfo={npmPackageInfo} />
				)}
			</StyledCardContent>
		</StyledCard>
	);
}

export default NPMPackageCard;
