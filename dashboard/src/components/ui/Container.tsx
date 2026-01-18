import type { ReactNode, CSSProperties } from 'react';
import styles from './Container.module.css';

interface ContainerProps {
	children: ReactNode;
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
	style?: CSSProperties;
}

export function Container({
	children,
	maxWidth = 'xl',
	className,
	style,
}: ContainerProps) {
	const classes = [styles.container];

	switch (maxWidth) {
		case 'sm':
			classes.push(styles.containerSm);
			break;
		case 'md':
			classes.push(styles.containerMd);
			break;
		case 'lg':
			classes.push(styles.containerLg);
			break;
		case 'xl':
			classes.push(styles.containerXl);
			break;
	}

	if (className) classes.push(className);

	return (
		<div className={classes.join(' ')} style={style}>
			{children}
		</div>
	);
}
