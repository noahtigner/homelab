import { Box, Skeleton, Typography, useTheme } from '@mui/material';
import {
	VideoLibraryOutlined as VideoIcon,
	LiveTvOutlined as TvIcon,
	MovieOutlined as MovieIcon,
	MusicNoteOutlined as MusicIcon,
	PhotoOutlined as PhotoIcon,
} from '@mui/icons-material';
import { StyledCard, StyledCardContent } from '../StyledCard';
import { usePlexLibrary } from '../../hooks/usePlexLibrary';

function getIconForType(type: string) {
	switch (type) {
		case 'movie':
			return MovieIcon;
		case 'show':
			return TvIcon;
		case 'artist':
			return MusicIcon;
		case 'photo':
			return PhotoIcon;
		default:
			return VideoIcon;
	}
}

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

function PlexMediaLibraryCardContent() {
	const theme = useTheme();
	const { isLoading, isError, data } = usePlexLibrary();

	if (isError) {
		return (
			<Typography color="error" sx={{ py: 2 }}>
				Failed to load Plex library data
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

	return (
		<Box>
			{data.sections.map((section) => {
				const IconComponent = getIconForType(section.type);
				return (
					<MediaRow
						key={section.key}
						icon={
							<IconComponent
								sx={{
									fontSize: 20,
									color: theme.palette.text.secondary,
								}}
							/>
						}
						label={section.title}
						count={section.count}
					/>
				);
			})}
		</Box>
	);
}

function PlexMediaLibraryCard() {
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
				<PlexMediaLibraryCardContent />
			</StyledCardContent>
		</StyledCard>
	);
}

export default PlexMediaLibraryCard;
