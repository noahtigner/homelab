import type { ReactNode, CSSProperties } from 'react';
import styles from './Icon.module.css';

interface IconProps {
	children: ReactNode;
	color?:
		| 'inherit'
		| 'primary'
		| 'success'
		| 'error'
		| 'warning'
		| 'secondary';
	size?: 'small' | 'medium' | 'large';
	fontSize?: number | string;
	className?: string;
	style?: CSSProperties;
}

export function Icon({
	children,
	color = 'inherit',
	size = 'medium',
	fontSize,
	className,
	style,
}: IconProps) {
	const classes = [styles.icon];

	switch (size) {
		case 'small':
			classes.push(styles.iconSmall);
			break;
		case 'large':
			classes.push(styles.iconLarge);
			break;
		default:
			classes.push(styles.iconMedium);
	}

	switch (color) {
		case 'primary':
			classes.push(styles.colorPrimary);
			break;
		case 'success':
			classes.push(styles.colorSuccess);
			break;
		case 'error':
			classes.push(styles.colorError);
			break;
		case 'warning':
			classes.push(styles.colorWarning);
			break;
		case 'secondary':
			classes.push(styles.colorSecondary);
			break;
	}

	if (className) classes.push(className);

	const finalStyle: CSSProperties = { ...style };
	if (fontSize !== undefined) {
		finalStyle.fontSize =
			typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
	}

	return (
		<span className={classes.join(' ')} style={finalStyle}>
			{children}
		</span>
	);
}
