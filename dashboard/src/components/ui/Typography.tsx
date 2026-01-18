import type { ReactNode, CSSProperties, ElementType } from 'react';
import styles from './Typography.module.css';

type TypographyVariant =
	| 'h1'
	| 'h2'
	| 'h3'
	| 'h4'
	| 'body1'
	| 'body2'
	| 'subtitle1'
	| 'subtitle2';

interface TypographyProps {
	children?: ReactNode;
	variant?: TypographyVariant;
	component?: ElementType;
	color?: 'primary' | 'secondary' | 'error' | 'success' | 'inherit';
	className?: string;
	style?: CSSProperties;
}

const variantToElement: Record<TypographyVariant, ElementType> = {
	h1: 'h1',
	h2: 'h2',
	h3: 'h3',
	h4: 'h4',
	body1: 'p',
	body2: 'p',
	subtitle1: 'p',
	subtitle2: 'p',
};

export function Typography({
	children,
	variant = 'body1',
	component,
	color,
	className,
	style,
}: TypographyProps) {
	const Component = component || variantToElement[variant];
	const classes = [styles.typography, styles[variant]];

	switch (color) {
		case 'secondary':
			classes.push(styles.colorSecondary);
			break;
		case 'error':
			classes.push(styles.colorError);
			break;
		case 'success':
			classes.push(styles.colorSuccess);
			break;
		case 'primary':
			classes.push(styles.colorPrimary);
			break;
	}

	if (className) classes.push(className);

	return (
		<Component className={classes.join(' ')} style={style}>
			{children}
		</Component>
	);
}
