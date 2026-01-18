import { Chip, Link } from '../ui';
import {
	CheckCircleIcon,
	CircleOutlinedIcon,
	ErrorOutlineIcon,
} from '../icons';
import type { ServiceStatus } from '../../types';

const statusToColor = (status: ServiceStatus) => {
	switch (status) {
		case 'ok':
			return 'success';
		case 'warning':
			return 'warning';
		case 'error':
			return 'error';
		case 'loading':
		default:
			return 'default';
	}
};

const statusToIcon = (status: ServiceStatus) => {
	switch (status) {
		case 'ok':
			return <CheckCircleIcon />;
		case 'warning':
		case 'error':
			return <ErrorOutlineIcon />;
		case 'loading':
		default:
			return <CircleOutlinedIcon />;
	}
};

function StatusChip({
	label,
	status,
	url,
}: {
	label: string;
	status: ServiceStatus;
	url?: string;
}) {
	return (
		<Chip
			label={
				url ? (
					<Link
						href={url}
						target="_blank"
						color="inherit"
						style={{ textDecoration: 'none' }}
					>
						{label}
					</Link>
				) : (
					label
				)
			}
			color={statusToColor(status)}
			icon={statusToIcon(status)}
			style={{ justifyContent: 'start', width: '100%' }}
		/>
	);
}

export default StatusChip;
