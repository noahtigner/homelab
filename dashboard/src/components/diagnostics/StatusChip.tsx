import { Chip } from '@mui/material';
import {
	CheckCircle as CheckCircleIcon,
	CircleOutlined as CircleIcon,
	ErrorOutlineOutlined as ErrorCircleIcon,
} from '@mui/icons-material';
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
			return <ErrorCircleIcon />;
		case 'loading':
		default:
			return <CircleIcon />;
	}
};

function StatusChip({
	label,
	status,
}: {
	label: string;
	status: ServiceStatus;
}) {
	return (
		<Chip
			label={label}
			color={statusToColor(status)}
			icon={statusToIcon(status)}
			sx={{ justifyContent: 'start' }}
			// sx={{
			//   paddingY: '4px',
			//   justifyContent: 'start',
			//   // height: 'auto',
			//   '& .MuiChip-label': {
			//     display: 'block',
			//     whiteSpace: 'normal',
			//   },
			// }}
		/>
	);
}

export default StatusChip;
