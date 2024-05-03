import { type ReactNode } from 'react';
import { Box, Skeleton, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import { StyledCard, StyledCardContent } from '../StyledCard';

function DiagnosticsCard({
	title,
	values,
	icon,
	loading = false,
}: {
	title: string;
	values: string[];
	icon: ReactNode;
	loading?: boolean;
}) {
	const theme = useTheme();

	return (
		<Grid xs={12} sm={6} md={3}>
			<StyledCard variant="outlined">
				<StyledCardContent>
					<Typography
						sx={{
							fontSize: '1.25rem',
							marginBottom: theme.spacing(0.25),
						}}
						variant="h2"
					>
						{title}
					</Typography>
					<Box
						sx={{
							display: 'flex',
							flexGrow: 1,
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<Box>
							{loading ? (
								<Skeleton
									variant="text"
									width={100}
									height={36}
								/>
							) : (
								values.map((v) => (
									<Typography
										key={v}
										sx={{
											fontSize:
												values.length > 1
													? '0.75rem'
													: '2rem',
											wordBreak: 'break-word',
										}}
										variant={'h3'}
									>
										{v}
									</Typography>
								))
							)}
						</Box>
						{icon}
					</Box>
				</StyledCardContent>
			</StyledCard>
		</Grid>
	);
}

export default DiagnosticsCard;
