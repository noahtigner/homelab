import type { ReactNode, CSSProperties } from 'react';
import styles from './Grid.module.css';

type GridSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface GridProps {
	children: ReactNode;
	container?: boolean;
	xs?: GridSize;
	sm?: GridSize;
	md?: GridSize;
	lg?: GridSize;
	xl?: GridSize;
	spacing?: number;
	className?: string;
	style?: CSSProperties;
}

export function Grid({
	children,
	container = false,
	xs,
	sm,
	md,
	lg,
	xl,
	spacing,
	className,
	style,
}: GridProps) {
	const classes = [styles.grid];

	if (container) {
		classes.push(styles.gridContainer);
	}

	if (xs) classes.push(styles[`xs${xs}` as keyof typeof styles]);
	if (sm) classes.push(styles[`sm${sm}` as keyof typeof styles]);
	if (md) classes.push(styles[`md${md}` as keyof typeof styles]);
	if (lg) classes.push(styles[`lg${lg}` as keyof typeof styles]);
	if (xl) classes.push(styles[`xl${xl}` as keyof typeof styles]);

	if (className) classes.push(className);

	const finalStyle: CSSProperties = { ...style };
	if (spacing !== undefined) {
		finalStyle.gap = `calc(var(--spacing-unit) * ${spacing})`;
	}

	return (
		<div className={classes.join(' ')} style={finalStyle}>
			{children}
		</div>
	);
}
