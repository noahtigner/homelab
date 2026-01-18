import type { CSSProperties } from 'react';
import styles from './icons.module.css';

interface IconBaseProps {
	color?:
		| 'inherit'
		| 'primary'
		| 'success'
		| 'error'
		| 'warning'
		| 'secondary';
	fontSize?: number;
	className?: string;
	style?: CSSProperties;
}

function getIconClasses(
	color: IconBaseProps['color'] = 'inherit',
	className?: string
): string {
	const classes = [styles.icon];

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
	return classes.join(' ');
}

function getIconStyle(fontSize?: number, style?: CSSProperties): CSSProperties {
	const finalStyle: CSSProperties = { ...style };
	if (fontSize !== undefined) {
		finalStyle.fontSize = fontSize;
	}
	return finalStyle;
}

// Status Icons
export function CheckCircleIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
			</svg>
		</span>
	);
}

export function CircleOutlinedIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
			</svg>
		</span>
	);
}

export function CircleIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<circle cx="12" cy="12" r="10" />
			</svg>
		</span>
	);
}

export function ErrorOutlineIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
			</svg>
		</span>
	);
}

// Navigation Icons
export function LinkIcon({ color, fontSize, className, style }: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
			</svg>
		</span>
	);
}

// Trend Icons
export function TrendingUpIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
			</svg>
		</span>
	);
}

export function TrendingDownIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z" />
			</svg>
		</span>
	);
}

// Infrastructure Icons
export function DnsIcon({ color, fontSize, className, style }: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
			</svg>
		</span>
	);
}

export function BlockIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z" />
			</svg>
		</span>
	);
}

export function AccessTimeIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
			</svg>
		</span>
	);
}

export function StorageIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z" />
			</svg>
		</span>
	);
}

export function MemoryIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z" />
			</svg>
		</span>
	);
}

export function SaveIcon({ color, fontSize, className, style }: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
			</svg>
		</span>
	);
}

export function ThermostatIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1h-1v1h1v2h-1v1h1v2h-2V5z" />
			</svg>
		</span>
	);
}

// Media Icons
export function MovieIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
			</svg>
		</span>
	);
}

export function TvIcon({ color, fontSize, className, style }: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
			</svg>
		</span>
	);
}

export function MusicNoteIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
			</svg>
		</span>
	);
}

export function PhotoIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
			</svg>
		</span>
	);
}

export function VideoLibraryIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
			</svg>
		</span>
	);
}

export function PlayIcon({ color, fontSize, className, style }: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M8 5v14l11-7z" />
			</svg>
		</span>
	);
}

export function PauseIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
			</svg>
		</span>
	);
}

// Achievement Icons
export function TrophyIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
			</svg>
		</span>
	);
}

export function DownloadIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
			</svg>
		</span>
	);
}

export function CompareArrowsIcon({
	color,
	fontSize,
	className,
	style,
}: IconBaseProps) {
	return (
		<span
			className={getIconClasses(color, className)}
			style={getIconStyle(fontSize, style)}
		>
			<svg viewBox="0 0 24 24">
				<path d="M9.01 14H2v2h7.01v3L13 15l-3.99-4v3zm5.98-1v-3H22V8h-7.01V5L11 9l3.99 4z" />
			</svg>
		</span>
	);
}
