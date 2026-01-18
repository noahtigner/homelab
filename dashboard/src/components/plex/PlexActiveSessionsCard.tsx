import { Box, Chip, LinearProgress, Link, Skeleton, Typography } from '../ui';
import {
	MovieIcon,
	MusicNoteIcon,
	PauseIcon,
	PlayIcon,
	TvIcon,
} from '../icons';
import { StyledCard, StyledCardContent } from '../StyledCard';
import { usePlexSessions } from '../../hooks/usePlexSessions';
import type { z } from 'zod';
import type { plexSessionSchema } from '../../types/schemas';

type PlexSession = z.infer<typeof plexSessionSchema>;

function getMediaIcon(mediaType: string) {
	switch (mediaType) {
		case 'movie':
			return <MovieIcon fontSize={18} />;
		case 'episode':
			return <TvIcon fontSize={18} />;
		case 'track':
			return <MusicNoteIcon fontSize={18} />;
		default:
			return <MovieIcon fontSize={18} />;
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
	const isPlaying = session.player.state === 'playing';

	return (
		<Box
			display="flex"
			flexDirection="column"
			gap={0.5}
			style={{
				paddingTop: 'calc(var(--spacing-unit) * 1)',
				paddingBottom: 'calc(var(--spacing-unit) * 1)',
				borderBottom: '1px solid var(--color-divider)',
			}}
		>
			<Box display="flex" alignItems="center" gap={1}>
				<Box style={{ color: 'var(--color-text-secondary)' }}>
					{getMediaIcon(session.media_type)}
				</Box>
				<Typography
					style={{
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
					<PlayIcon fontSize={16} color="success" />
				) : (
					<PauseIcon fontSize={16} color="warning" />
				)}
			</Box>
			<Box display="flex" alignItems="center" gap={1}>
				<Chip
					label={session.username}
					size="small"
					style={{
						fontSize: '0.75rem',
						height: 20,
					}}
				/>
				<Typography
					style={{
						fontSize: '0.75rem',
						flexGrow: 1,
					}}
					color="secondary"
				>
					{session.player.title} ({session.player.platform})
				</Typography>
			</Box>
			<Box display="flex" alignItems="center" gap={1}>
				<LinearProgress
					value={session.progress_percent}
					style={{
						flexGrow: 1,
						height: 4,
						borderRadius: 'var(--border-radius)',
					}}
				/>
				<Typography
					style={{
						fontSize: '0.625rem',
						minWidth: 80,
						textAlign: 'right',
					}}
					color="secondary"
				>
					{formatDuration(session.view_offset_ms)} /{' '}
					{formatDuration(session.duration_ms)}
				</Typography>
			</Box>
		</Box>
	);
}

function PlexActiveSessionsCardContent() {
	const { isLoading, isError, data } = usePlexSessions();

	if (isError) {
		return (
			<Typography
				color="error"
				style={{
					paddingTop: 'calc(var(--spacing-unit) * 2)',
					paddingBottom: 'calc(var(--spacing-unit) * 2)',
				}}
			>
				Failed to load active sessions
			</Typography>
		);
	}

	if (isLoading || !data) {
		return (
			<Box display="flex" flexDirection="column" gap={1}>
				{[1, 2].map((i) => (
					<Skeleton key={i} variant="rectangular" height={72} />
				))}
			</Box>
		);
	}

	if (data.count === 0) {
		return (
			<Typography
				style={{
					paddingTop: 'calc(var(--spacing-unit) * 2)',
					paddingBottom: 'calc(var(--spacing-unit) * 2)',
					textAlign: 'center',
				}}
				color="secondary"
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
	const { data } = usePlexSessions();
	const sessionCount = data?.count ?? 0;

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
						style={{
							textDecoration: 'none',
							color: 'inherit',
							flexGrow: 1,
						}}
					>
						<Typography
							style={{ fontSize: '1.25rem' }}
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
							style={{ fontSize: '0.75rem', height: 20 }}
						/>
					)}
				</Box>
				<PlexActiveSessionsCardContent />
			</StyledCardContent>
		</StyledCard>
	);
}

export default PlexActiveSessionsCard;
