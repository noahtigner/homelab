import type { ReactNode, CSSProperties, AnchorHTMLAttributes } from 'react';
import styles from './Link.module.css';

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	children: ReactNode;
	href?: string;
	target?: string;
	rel?: string;
	color?: 'primary' | 'inherit';
	className?: string;
	style?: CSSProperties;
}

export function Link({
	children,
	href,
	target,
	rel,
	color = 'primary',
	className,
	style,
	...props
}: LinkProps) {
	const classes = [styles.link];
	if (color === 'inherit') classes.push(styles.linkInheritColor);
	if (className) classes.push(className);

	return (
		<a
			href={href}
			target={target}
			rel={rel}
			className={classes.join(' ')}
			style={style}
			{...props}
		>
			{children}
		</a>
	);
}
