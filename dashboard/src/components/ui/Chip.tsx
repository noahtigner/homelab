import type { ReactNode, CSSProperties } from 'react';
import styles from './Chip.module.css';

interface ChipProps {
	label: ReactNode;
	icon?: ReactNode;
	color?: 'default' | 'success' | 'error' | 'warning' | 'primary';
	size?: 'small' | 'medium';
	className?: string;
	style?: CSSProperties;
}

export function Chip({
	label,
	icon,
	color = 'default',
	size = 'medium',
	className,
	style,
}: ChipProps) {
	const classes = [styles.chip];

	if (size === 'small') classes.push(styles.chipSmall);

	switch (color) {
		case 'success':
			classes.push(styles.chipSuccess);
			break;
		case 'error':
			classes.push(styles.chipError);
			break;
		case 'warning':
			classes.push(styles.chipWarning);
			break;
		case 'primary':
			classes.push(styles.chipPrimary);
			break;
	}

	if (className) classes.push(className);

	return (
		<span className={classes.join(' ')} style={style}>
			{icon && <span className={styles.chipIcon}>{icon}</span>}
			{label}
		</span>
	);
}
