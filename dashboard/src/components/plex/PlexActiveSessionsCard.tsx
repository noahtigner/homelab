import {
	Box,
	Chip,
	LinearProgress,
	Link,
	Skeleton,
	Typography,
	useTheme,
} from '@mui/material';
import {
	MovieOutlined as MovieIcon,
	MusicNoteOutlined as MusicIcon,
	PauseOutlined as PauseIcon,
	PlayArrowOutlined as PlayIcon,
	TvOutlined as TvIcon,
} from '@mui/icons-material';
import { StyledCard, StyledCardContent } from '../StyledCard';
import { usePlexSessions } from '../../hooks/usePlexSessions';
import type { z } from 'zod';
import type { plexSessionSchema } from '../../types/schemas';

type PlexSession = z.infer<typeof plexSessionSchema>;

function getMediaIcon(mediaType: string) {
	switch (mediaType) {
		case 'movie':
			return <MovieIcon sx={{ fontSize: 18 }} />;
		case 'episode':
			return <TvIcon sx={{ fontSize: 18 }} />;
		case 'track':
			return <MusicIcon sx={{ fontSize: 18 }} />;
		default:
			return <MovieIcon sx={{ fontSize: 18 }} />;
	}
}

function formatDuration(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getMediaTitle(session: PlexSession): string {
	if (session.media_type === 'episode' && session.grandparent_title) {
		return `${session.grandparent_title} - ${session.title}`;
	}
	return session.title;
}

function SessionRow({ session }: { session: PlexSession }) {
	const theme = useTheme();
	const isPlaying = session.player.state === 'playing';

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: theme.spacing(0.5),
				py: theme.spacing(1),
				borderBottom: `1px solid ${theme.palette.divider}`,
				'&:last-child': {
					borderBottom: 'none',
					pb: 0,
				},
			}}
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: theme.spacing(1),
				}}
			>
				<Box sx={{ color: theme.palette.text.secondary }}>
					{getMediaIcon(session.media_type)}
				</Box>
				<Typography
					sx={{
						fontSize: '0.875rem',
						fontWeight: 500,
						flexGrow: 1,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					{getMediaTitle(session)}
				</Typography>
				{isPlaying ? (
					<PlayIcon
						sx={{ fontSize: 16, color: theme.palette.success.main }}
					/>
				) : (
					<PauseIcon
						sx={{ fontSize: 16, color: theme.palette.warning.main }}
					/>
				)}
			</Box>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: theme.spacing(1),
				}}
			>
				<Chip
					label={session.username}
					size="small"
					sx={{
						fontSize: '0.75rem',
						height: 20,
					}}
				/>
				<Typography
					sx={{
						fontSize: '0.75rem',
						color: theme.palette.text.secondary,
						flexGrow: 1,
					}}
				>
					{session.player.title} ({session.player.platform})
				</Typography>
			</Box>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: theme.spacing(1),
				}}
			>
				<LinearProgress
					variant="determinate"
					value={session.progress_percent}
					sx={{
						flexGrow: 1,
						height: 4,
						borderRadius: 1,
					}}
				/>
				<Typography
					sx={{
						fontSize: '0.625rem',
						color: theme.palette.text.secondary,
						minWidth: 80,
						textAlign: 'right',
					}}
				>
					{formatDuration(session.view_offset_ms)} /{' '}
					{formatDuration(session.duration_ms)}
				</Typography>
			</Box>
		</Box>
	);
}

function PlexActiveSessionsCardContent() {
	const theme = useTheme();
	const { isLoading, isError, data } = usePlexSessions();

	if (isError) {
		return (
			<Typography color="error" sx={{ py: 2 }}>
				Failed to load active sessions
			</Typography>
		);
	}

	if (isLoading || !data) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
				{[1, 2].map((i) => (
					<Skeleton key={i} variant="rectangular" height={72} />
				))}
			</Box>
		);
	}

	if (data.count === 0) {
		return (
			<Typography
				sx={{
					py: theme.spacing(2),
					color: theme.palette.text.secondary,
					textAlign: 'center',
				}}
			>
				No active streams
			</Typography>
		);
	}

	return (
		<Box>
			{data.sessions.map((session) => (
				<SessionRow
					key={`${session.username}-${session.title}-${session.player.title}`}
					session={session}
				/>
			))}
		</Box>
	);
}

const PLEX_URL = 'https://app.plex.tv/desktop';

function PlexActiveSessionsCard() {
	const theme = useTheme();
	const { data } = usePlexSessions();
	const sessionCount = data?.count ?? 0;

	return (
		<StyledCard variant="outlined">
			<StyledCardContent>
				<Box
					display="flex"
					alignItems="center"
					sx={{ marginBottom: theme.spacing(0.5) }}
				>
					<img
						src="/plex.svg"
						alt="Plex"
						width={20}
						style={{
							marginRight: theme.spacing(1),
							marginBottom: 2,
						}}
					/>
					<Link
						href={PLEX_URL}
						target="_blank"
						rel="noreferrer"
						sx={{
							textDecoration: 'none',
							color: 'inherit',
							flexGrow: 1,
						}}
					>
						<Typography
							sx={{
								fontSize: '1.25rem',
							}}
							variant="h2"
						>
							Active Streams
						</Typography>
					</Link>
					{sessionCount > 0 && (
						<Chip
							label={sessionCount}
							size="small"
							color="primary"
							sx={{ fontSize: '0.75rem', height: 20 }}
						/>
					)}
				</Box>
				<PlexActiveSessionsCardContent />
			</StyledCardContent>
		</StyledCard>
	);
}

export default PlexActiveSessionsCard;
