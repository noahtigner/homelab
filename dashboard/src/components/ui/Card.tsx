import type { ReactNode, CSSProperties } from 'react';
import styles from './Card.module.css';

interface CardProps {
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
}

export function Card({ children, className, style }: CardProps) {
	return (
		<div className={`${styles.card} ${className || ''}`} style={style}>
			{children}
		</div>
	);
}

interface CardContentProps {
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
}

export function CardContent({ children, className, style }: CardContentProps) {
	return (
		<div
			className={`${styles.cardContent} ${className || ''}`}
			style={style}
		>
			{children}
		</div>
	);
}
