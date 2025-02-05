import { type ReactNode } from 'react';
import { Box, Link, Skeleton, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { StyledCard, StyledCardContent } from '../StyledCard';

function PiholeSummaryCardWrapper({
	title,
	icon,
	child1,
	child2,
}: {
	title: string;
	icon: ReactNode;
	child1: ReactNode;
	child2: ReactNode;
}) {
	const theme = useTheme();
	return (
		<Grid xs={12} sm={6} md={4}>
			<StyledCard variant="outlined">
				<StyledCardContent>
					<Box
						display="flex"
						alignItems="center"
						sx={{ marginBottom: theme.spacing(0.5) }}
					>
						<img
							src="/pihole.svg"
							alt="Pihole Admin Dashboard"
							height={20}
							style={{ marginRight: theme.spacing(1) }}
						/>
						<Link
							href={`http://${import.meta.env.VITE_PIHOLE_IP}/admin/`}
							target="_blank"
							rel="noreferrer"
							sx={{ textDecoration: 'none', color: 'inherit' }}
						>
							<Typography
								sx={{
									fontSize: '1.25rem',
								}}
								variant="h2"
							>
								{title}
							</Typography>
						</Link>
					</Box>
					<Box
						sx={{
							display: 'flex',
							flexGrow: 1,
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						{child1}
						{icon}
					</Box>
					{child2}
				</StyledCardContent>
			</StyledCard>
		</Grid>
	);
}

function PiholeSummaryCard({
	title,
	value1,
	value2,
	icon,
}: {
	title: string;
	value1: string | number;
	value2: string | number;
	icon: ReactNode;
}) {
	const theme = useTheme();

	return (
		<PiholeSummaryCardWrapper
			title={title}
			icon={icon}
			child1={
				<Typography
					sx={{
						fontSize: '2.5rem',
						marginBottom: theme.spacing(0.5),
					}}
					variant="h3"
				>
					{value1}
				</Typography>
			}
			child2={
				<Typography sx={{ fontSize: '1rem' }} variant="h4">
					{value2}
				</Typography>
			}
		/>
	);
}

function PiholeSummaryCardLoading({
	title,
	icon,
}: {
	title: string;
	icon: ReactNode;
}) {
	return (
		<PiholeSummaryCardWrapper
			title={title}
			icon={icon}
			child1={
				<Skeleton
					variant="text"
					width="100%"
					style={{
						fontSize: '2.5rem',
					}}
				/>
			}
			child2={<Skeleton variant="text" sx={{ fontSize: '1rem' }} />}
		/>
	);
}

function PiholeSummaryCardError({
	title,
	icon,
	errorMessage,
}: {
	title: string;
	icon: ReactNode;
	errorMessage: string;
}) {
	return (
		<PiholeSummaryCardWrapper
			title={title}
			icon={icon}
			child1={
				<Skeleton
					variant="text"
					width="100%"
					sx={{
						fontSize: '2.5rem',
					}}
				/>
			}
			child2={
				<Typography
					sx={{ fontSize: '1rem', marginTop: '10px' }}
					variant="h4"
				>
					{errorMessage}
				</Typography>
			}
		/>
	);
}

export default PiholeSummaryCard;
export { PiholeSummaryCardLoading, PiholeSummaryCardError };
