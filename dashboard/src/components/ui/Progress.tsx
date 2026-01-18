import type { CSSProperties } from 'react';
import { Progress as BaseProgress } from '@base-ui/react/progress';
import styles from './Progress.module.css';

interface LinearProgressProps {
	value: number;
	color?: 'primary' | 'success' | 'error' | 'warning';
	className?: string;
	style?: CSSProperties;
}

export function LinearProgress({
	value,
	color = 'primary',
	className,
	style,
}: LinearProgressProps) {
	const barClasses = [styles.progressBar];

	switch (color) {
		case 'success':
			barClasses.push(styles.progressSuccess);
			break;
		case 'error':
			barClasses.push(styles.progressError);
			break;
		case 'warning':
			barClasses.push(styles.progressWarning);
			break;
		default:
			barClasses.push(styles.progressPrimary);
	}

	return (
		<BaseProgress.Root
			value={value}
			className={`${styles.progress} ${className || ''}`}
			style={style}
		>
			<BaseProgress.Indicator
				className={barClasses.join(' ')}
				style={{ width: `${value}%` }}
			/>
		</BaseProgress.Root>
	);
}
