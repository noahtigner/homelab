import { Box, Skeleton, Typography, useTheme } from '@mui/material';
import {
	VideoLibraryOutlined as VideoIcon,
	LiveTvOutlined as TvIcon,
	MovieOutlined as MovieIcon,
} from '@mui/icons-material';
import { StyledCard, StyledCardContent } from '../StyledCard';
import { useNasFolders } from '../../hooks/useNasFolders';

function MediaRow({
	icon,
	label,
	count,
}: {
	icon: React.ReactNode;
	label: string;
	count: number;
}) {
	const theme = useTheme();

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: theme.spacing(1.5),
				py: theme.spacing(0.75),
			}}
		>
			{icon}
			<Typography
				sx={{
					fontSize: '0.875rem',
					flexGrow: 1,
				}}
			>
				{label}
			</Typography>
			<Typography
				sx={{
					fontSize: '1.25rem',
					fontWeight: 500,
					textAlign: 'right',
				}}
			>
				{count.toLocaleString()}
			</Typography>
		</Box>
	);
}

function NasMediaCardContent() {
	const theme = useTheme();
	const { isLoading, isError, data } = useNasFolders('/media');

	if (isError) {
		return (
			<Typography color="error" sx={{ py: 2 }}>
				Failed to load media library data
			</Typography>
		);
	}

	if (isLoading || !data) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
				{[1, 2].map((i) => (
					<Skeleton key={i} variant="rectangular" height={32} />
				))}
			</Box>
		);
	}

	const tvFolder = data.folders.find((f) => f.name === 'tv');
	const moviesFolder = data.folders.find((f) => f.name === 'movies');

	const tvShowCount = tvFolder?.num_dir ?? 0;
	const moviesCount = moviesFolder?.num_dir ?? 0;

	return (
		<Box>
			<MediaRow
				icon={
					<TvIcon
						sx={{
							fontSize: 20,
							color: theme.palette.text.secondary,
						}}
					/>
				}
				label="TV Shows (Seasons)"
				count={tvShowCount}
			/>
			<MediaRow
				icon={
					<MovieIcon
						sx={{
							fontSize: 20,
							color: theme.palette.text.secondary,
						}}
					/>
				}
				label="Movies"
				count={moviesCount}
			/>
		</Box>
	);
}

function NasMediaCard() {
	const theme = useTheme();

	return (
		<StyledCard variant="outlined">
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					sx={{ marginBottom: theme.spacing(0.5) }}
				>
					<VideoIcon
						sx={{
							fontSize: 20,
							marginRight: theme.spacing(1),
							marginBottom: '2px',
						}}
					/>
					<Typography
						sx={{
							fontSize: '1.25rem',
						}}
						variant="h2"
					>
						Media Library
					</Typography>
				</Box>
				<NasMediaCardContent />
			</StyledCardContent>
		</StyledCard>
	);
}

export default NasMediaCard;
