import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
	variant?: 'text' | 'rectangular';
	width?: number | string;
	height?: number | string;
	className?: string;
	style?: CSSProperties;
}

export function Skeleton({
	variant = 'text',
	width,
	height,
	className,
	style,
}: SkeletonProps) {
	const classes = [styles.skeleton];

	if (variant === 'text') {
		classes.push(styles.skeletonText);
	} else {
		classes.push(styles.skeletonRectangular);
	}

	if (className) classes.push(className);

	return (
		<span
			className={classes.join(' ')}
			style={{
				width: typeof width === 'number' ? `${width}px` : width,
				height: typeof height === 'number' ? `${height}px` : height,
				display: 'block',
				...style,
			}}
		/>
	);
}
