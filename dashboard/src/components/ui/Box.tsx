import type { ReactNode, CSSProperties, ElementType } from 'react';
import styles from './Box.module.css';

interface BoxProps {
	children?: ReactNode;
	component?: ElementType;
	display?: 'block' | 'flex' | 'inline-flex' | 'grid';
	flexDirection?: 'row' | 'column';
	justifyContent?:
		| 'flex-start'
		| 'flex-end'
		| 'center'
		| 'space-between'
		| 'space-around';
	alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
	flexGrow?: number;
	flexWrap?: 'wrap' | 'nowrap';
	gap?: number | string;
	className?: string;
	style?: CSSProperties;
}

export function Box({
	children,
	component: Component = 'div',
	display,
	flexDirection,
	justifyContent,
	alignItems,
	flexGrow,
	flexWrap,
	gap,
	className,
	style,
}: BoxProps) {
	const classes = [styles.box];

	if (display === 'flex') classes.push(styles.boxFlex);
	else if (display === 'inline-flex') classes.push(styles.boxInlineFlex);
	else if (display === 'grid') classes.push(styles.boxGrid);

	if (className) classes.push(className);

	const finalStyle: CSSProperties = { ...style };
	if (flexDirection) finalStyle.flexDirection = flexDirection;
	if (justifyContent) finalStyle.justifyContent = justifyContent;
	if (alignItems) finalStyle.alignItems = alignItems;
	if (flexGrow !== undefined) finalStyle.flexGrow = flexGrow;
	if (flexWrap) finalStyle.flexWrap = flexWrap;
	if (gap !== undefined) {
		finalStyle.gap =
			typeof gap === 'number'
				? `calc(var(--spacing-unit) * ${gap})`
				: gap;
	}

	return (
		<Component className={classes.join(' ')} style={finalStyle}>
			{children}
		</Component>
	);
}
