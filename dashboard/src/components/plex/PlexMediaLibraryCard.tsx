import { Box, Link, Skeleton, Typography } from '../ui';
import {
	TvIcon,
	MovieIcon,
	MusicNoteIcon,
	PhotoIcon,
	VideoLibraryIcon,
} from '../icons';
import { StyledCard, StyledCardContent } from '../StyledCard';
import { usePlexLibrary } from '../../hooks/usePlexLibrary';

function getIconForType(type: string) {
	switch (type) {
		case 'movie':
			return MovieIcon;
		case 'show':
			return TvIcon;
		case 'artist':
			return MusicNoteIcon;
		case 'photo':
			return PhotoIcon;
		default:
			return VideoLibraryIcon;
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
	return (
		<Box
			display="flex"
			alignItems="center"
			gap={1.5}
			style={{
				paddingTop: 'calc(var(--spacing-unit) * 0.75)',
				paddingBottom: 'calc(var(--spacing-unit) * 0.75)',
			}}
		>
			{icon}
			<Typography
				style={{
					fontSize: '0.875rem',
					flexGrow: 1,
				}}
			>
				{label}
			</Typography>
			<Typography
				style={{
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
	const { isLoading, isError, data } = usePlexLibrary();

	if (isError) {
		return (
			<Typography
				color="error"
				style={{
					paddingTop: 'calc(var(--spacing-unit) * 2)',
					paddingBottom: 'calc(var(--spacing-unit) * 2)',
				}}
			>
				Failed to load Plex library data
			</Typography>
		);
	}

	if (isLoading || !data) {
		return (
			<Box display="flex" flexDirection="column" gap={1}>
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
						icon={<IconComponent fontSize={20} color="secondary" />}
						label={section.title}
						count={section.count}
					/>
				);
			})}
		</Box>
	);
}

const PLEX_URL = 'https://app.plex.tv/desktop';

function PlexMediaLibraryCard() {
	return (
		<StyledCard>
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					style={{ marginBottom: 'calc(var(--spacing-unit) * 0.5)' }}
				>
					<img
						src="/plex.svg"
						alt="Plex"
						width={20}
						style={{
							marginRight: 'calc(var(--spacing-unit) * 1)',
							marginBottom: 2,
						}}
					/>
					<Link
						href={PLEX_URL}
						target="_blank"
						rel="noreferrer"
						style={{ textDecoration: 'none', color: 'inherit' }}
					>
						<Typography
							style={{ fontSize: '1.25rem' }}
							variant="h2"
						>
							Media Library
						</Typography>
					</Link>
				</Box>
				<PlexMediaLibraryCardContent />
			</StyledCardContent>
		</StyledCard>
	);
}

export default PlexMediaLibraryCard;
