import type { ReactNode, CSSProperties } from 'react';
import styles from './Divider.module.css';

interface DividerProps {
	orientation?: 'horizontal' | 'vertical';
	children?: ReactNode;
	className?: string;
	style?: CSSProperties;
}

export function Divider({
	orientation = 'horizontal',
	children,
	className,
	style,
}: DividerProps) {
	const classes = [];

	if (children) {
		classes.push(styles.dividerWithText);
	} else {
		classes.push(styles.divider);
		if (orientation === 'vertical') {
			classes.push(styles.dividerVertical);
		}
	}

	if (className) classes.push(className);

	if (children) {
		return (
			<div
				className={classes.join(' ')}
				style={style}
				role="presentation"
			>
				{children}
			</div>
		);
	}

	return (
		<hr className={classes.join(' ')} style={style} role="presentation" />
	);
}
