import { type ReactNode } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import { StyledCard, StyledCardContent } from '../StyledCard';

function DiagnosticsCard({
	title,
	values,
	icon,
}: {
	title: string;
	values: string[];
	icon: ReactNode;
}) {
	const theme = useTheme();

	return (
		<Grid xs={12} sm={6} md={3}>
			<StyledCard variant="outlined">
				<StyledCardContent>
					<Typography
						sx={{
							fontSize: '1.25rem',
							marginBottom: theme.spacing(0.5),
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
							{values.map((v) => (
								<Typography
									key={v}
									sx={{
										fontSize:
											values.length > 1
												? '1rem'
												: '2.5rem',
										wordBreak: 'break-word',
									}}
									variant={'h3'}
								>
									{v}
								</Typography>
							))}
						</Box>
						{icon}
					</Box>
				</StyledCardContent>
			</StyledCard>
		</Grid>
	);
}

export default DiagnosticsCard;
