import { Tv, Film, Music, Image, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlexLibrary } from '../../hooks/usePlexLibrary';

function getIconForType(type: string) {
	const iconClass = 'size-5 text-muted-foreground';
	switch (type) {
		case 'movie':
			return <Film className={iconClass} />;
		case 'show':
			return <Tv className={iconClass} />;
		case 'artist':
			return <Music className={iconClass} />;
		case 'photo':
			return <Image className={iconClass} />;
		default:
			return <Video className={iconClass} />;
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
		<div className="flex items-center gap-3 py-1.5">
			{icon}
			<span className="grow text-sm">{label}</span>
			<span className="text-right text-xl font-medium">
				{count.toLocaleString()}
			</span>
		</div>
	);
}

function PlexMediaLibraryCardContent() {
	const { isLoading, isError, data } = usePlexLibrary();

	if (isError) {
		return (
			<p className="py-2 text-destructive-foreground">
				Failed to load Plex library data
			</p>
		);
	}

	if (isLoading || !data) {
		return (
			<div className="flex flex-col gap-2">
				{[1, 2].map((i) => (
					<Skeleton key={i} className="h-8 w-full" />
				))}
			</div>
		);
	}

	return (
		<div>
			{data.sections.map((section) => (
				<MediaRow
					key={section.key}
					icon={getIconForType(section.type)}
					label={section.title}
					count={section.count}
				/>
			))}
		</div>
	);
}

const PLEX_URL = 'https://app.plex.tv/desktop';

function PlexMediaLibraryCard() {
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
						className="no-underline text-inherit hover:text-primary"
					>
						<h2 className="text-xl">Media Library</h2>
					</a>
				</div>
				<PlexMediaLibraryCardContent />
			</CardContent>
		</Card>
	);
}

export default PlexMediaLibraryCard;
