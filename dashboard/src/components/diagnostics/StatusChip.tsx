import { CheckCircle, CircleAlert, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServiceStatus } from '../../types';

const statusStyles: Record<string, string> = {
	ok: 'bg-success/20 text-success-foreground border-success/30',
	warning: 'bg-warning/20 text-warning-foreground border-warning/30',
	error: 'bg-destructive/20 text-destructive-foreground border-destructive/30',
	loading: 'bg-muted text-muted-foreground border-border',
};

function statusIcon(status: ServiceStatus) {
	const size = 16;
	switch (status) {
		case 'ok':
			return <CheckCircle size={size} />;
		case 'warning':
		case 'error':
			return <CircleAlert size={size} />;
		case 'loading':
		default:
			return <Circle size={size} />;
	}
}

function StatusChip({
	label,
	status,
	url,
}: {
	label: string;
	status: ServiceStatus;
	url?: string;
}) {
	const content = (
		<div
			className={cn(
				'flex w-full items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors duration-150',
				statusStyles[status] ?? statusStyles.loading
			)}
		>
			{statusIcon(status)}
			<span className="truncate">{label}</span>
		</div>
	);

	if (url) {
		return (
			<a
				href={url}
				target="_blank"
				rel="noreferrer"
				className="group no-underline text-inherit hover:opacity-80"
			>
				{content}
			</a>
		);
	}

	return content;
}

export default StatusChip;
