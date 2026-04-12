import { Film, Music, Tv, Pause, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlexSessions } from '../../hooks/usePlexSessions';
import type { z } from 'zod';
import type { plexSessionSchema } from '../../types/schemas';

type PlexSession = z.infer<typeof plexSessionSchema>;

function getMediaIcon(mediaType: string) {
	const size = 18;
	switch (mediaType) {
		case 'movie':
			return <Film size={size} />;
		case 'episode':
			return <Tv size={size} />;
		case 'track':
			return <Music size={size} />;
		default:
			return <Film size={size} />;
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
		<div className="flex flex-col gap-1 border-b border-border py-2 last:border-b-0 last:pb-0">
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground">
					{getMediaIcon(session.media_type)}
				</span>
				<span className="grow truncate text-sm font-medium">
					{getMediaTitle(session)}
				</span>
				{isPlaying ? (
					<Play size={16} className="text-success-foreground" />
				) : (
					<Pause size={16} className="text-warning-foreground" />
				)}
			</div>
			<div className="flex items-center gap-2">
				<Badge variant="secondary" className="text-xs">
					{session.username}
				</Badge>
				<span className="grow text-xs text-muted-foreground">
					{session.player.title} ({session.player.platform})
				</span>
			</div>
			<div className="flex items-center gap-2">
				<Progress
					value={session.progress_percent}
					className="h-1 grow"
				/>
				<span className="min-w-[80px] text-right text-[0.625rem] text-muted-foreground">
					{formatDuration(session.view_offset_ms)} /{' '}
					{formatDuration(session.duration_ms)}
				</span>
			</div>
		</div>
	);
}

function PlexActiveSessionsCardContent() {
	const { isLoading, isError, data } = usePlexSessions();

	if (isError) {
		return (
			<p className="py-2 text-destructive-foreground">
				Failed to load active sessions
			</p>
		);
	}

	if (isLoading || !data) {
		return (
			<div className="flex flex-col gap-2">
				{[1, 2].map((i) => (
					<Skeleton key={i} className="h-[72px] w-full" />
				))}
			</div>
		);
	}

	if (data.count === 0) {
		return (
			<p className="py-4 text-center text-muted-foreground">
				No active streams
			</p>
		);
	}

	return (
		<div>
			{data.sessions.map((session) => (
				<SessionRow
					key={`${session.username}-${session.title}-${session.player.title}`}
					session={session}
				/>
			))}
		</div>
	);
}

const PLEX_URL = 'https://app.plex.tv/desktop';

function PlexActiveSessionsCard() {
	const { data } = usePlexSessions();
	const sessionCount = data?.count ?? 0;

	return (
		<Card>
			<CardContent>
				<div className="mb-1 flex items-center">
					<img
						src="/plex.svg"
						alt="Plex"
						width={20}
						className="mr-2"
					/>
					<a
						href={PLEX_URL}
						target="_blank"
						rel="noreferrer"
						className="grow no-underline text-inherit hover:text-primary"
					>
						<h2 className="text-xl">Active Streams</h2>
					</a>
					{sessionCount > 0 && (
						<Badge className="text-xs">{sessionCount}</Badge>
					)}
				</div>
				<PlexActiveSessionsCardContent />
			</CardContent>
		</Card>
	);
}

export default PlexActiveSessionsCard;
