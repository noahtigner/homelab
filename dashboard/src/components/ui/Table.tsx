import type { ReactNode, CSSProperties } from 'react';
import styles from './Table.module.css';

interface TableContainerProps {
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
}

export function TableContainer({
	children,
	className,
	style,
}: TableContainerProps) {
	return (
		<div
			className={`${styles.tableContainer} ${className || ''}`}
			style={style}
		>
			{children}
		</div>
	);
}

interface TableProps {
	children: ReactNode;
	size?: 'small' | 'medium';
	className?: string;
	style?: CSSProperties;
}

export function Table({
	children,
	size = 'medium',
	className,
	style,
}: TableProps) {
	const classes = [styles.table];
	if (size === 'small') classes.push(styles.tableSmall);
	if (className) classes.push(className);

	return (
		<table className={classes.join(' ')} style={style}>
			{children}
		</table>
	);
}

interface TableHeadProps {
	children: ReactNode;
	className?: string;
}

export function TableHead({ children, className }: TableHeadProps) {
	return (
		<thead className={`${styles.tableHead} ${className || ''}`}>
			{children}
		</thead>
	);
}

interface TableBodyProps {
	children: ReactNode;
	className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
	return <tbody className={className}>{children}</tbody>;
}

interface TableRowProps {
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
}

export function TableRow({ children, className, style }: TableRowProps) {
	return (
		<tr className={`${styles.tableRow} ${className || ''}`} style={style}>
			{children}
		</tr>
	);
}

interface TableCellProps {
	children?: ReactNode;
	component?: 'td' | 'th';
	align?: 'left' | 'center' | 'right';
	colSpan?: number;
	scope?: 'row' | 'col';
	className?: string;
	style?: CSSProperties;
}

export function TableCell({
	children,
	component = 'td',
	align = 'left',
	colSpan,
	scope,
	className,
	style,
}: TableCellProps) {
	const classes = [styles.tableCell];
	if (component === 'th') classes.push(styles.tableCellHeader);
	if (align === 'right') classes.push(styles.tableCellRight);
	if (align === 'center') classes.push(styles.tableCellCenter);
	if (className) classes.push(className);

	const Component = component;
	return (
		<Component
			className={classes.join(' ')}
			colSpan={colSpan}
			scope={scope}
			style={style}
		>
			{children}
		</Component>
	);
}
