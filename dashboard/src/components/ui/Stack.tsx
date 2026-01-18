import type { ReactNode, CSSProperties } from 'react';
import styles from './Stack.module.css';

interface StackProps {
	children: ReactNode;
	direction?: 'row' | 'column';
	spacing?: number;
	justifyContent?:
		| 'flex-start'
		| 'flex-end'
		| 'center'
		| 'space-between'
		| 'space-around';
	alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
	className?: string;
	style?: CSSProperties;
}

export function Stack({
	children,
	direction = 'column',
	spacing = 0,
	justifyContent,
	alignItems,
	className,
	style,
}: StackProps) {
	const classes = [styles.stack];

	if (direction === 'row') {
		classes.push(styles.stackRow);
	} else {
		classes.push(styles.stackColumn);
	}

	if (className) classes.push(className);

	const finalStyle: CSSProperties = { ...style };
	if (spacing) {
		finalStyle.gap = `calc(var(--spacing-unit) * ${spacing})`;
	}
	if (justifyContent) finalStyle.justifyContent = justifyContent;
	if (alignItems) finalStyle.alignItems = alignItems;

	return (
		<div className={classes.join(' ')} style={finalStyle}>
			{children}
		</div>
	);
}
