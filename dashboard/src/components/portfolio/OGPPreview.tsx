import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Box, Skeleton, Typography, useTheme } from '@mui/material';
import { StyledCard, StyledCardContent } from '../StyledCard';

function OGPPreview() {
	const theme = useTheme();

	const site_url = 'https://www.noahtigner.com/';
	const ogp_app_id = import.meta.env.VITE_OGP_IO_API_KEY;

	const { isPending, error, data } = useQuery({
		queryKey: ['ogpPreview', site_url, ogp_app_id],
		queryFn: () =>
			axios
				.get(
					`https://opengraph.io/api/1.1/site/${encodeURIComponent(
						site_url
					)}/?app_id=${ogp_app_id}`
				)
				.then((res) => res.data),
	});

	if (isPending || error) {
		return (
			<StyledCard variant="outlined">
				<StyledCardContent
					sx={{
						display: 'flex',
						flexDirection: 'row',
						gap: 2,
					}}
				>
					<Skeleton variant="rectangular" width={100} height={100} />
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-between',
						}}
					>
						<div>
							{error ? (
								<Typography
									sx={{
										fontSize: '0.75rem',
									}}
									variant="body1"
								>
									{error.message}
								</Typography>
							) : (
								<>
									<Skeleton
										variant="text"
										width={300}
										height={20}
									/>
									<Skeleton
										variant="text"
										width={500}
										height={20}
									/>
								</>
							)}
						</div>
					</Box>
				</StyledCardContent>
			</StyledCard>
		);
	}

	return (
		<StyledCard variant="outlined">
			<StyledCardContent
				sx={{
					display: 'flex',
					flexDirection: 'row',
					gap: 2,
				}}
			>
				<img
					src={data.hybridGraph.image}
					alt={data.hybridGraph.title}
					width={100}
				/>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
					}}
				>
					<Typography
						sx={{
							fontSize: '2rem',
							marginBottom: theme.spacing(0.5),
						}}
						variant="h3"
					>
						Portfolio: OGP Preview
					</Typography>
					<div>
						<Typography
							sx={{
								fontSize: '1rem',
								marginBottom: theme.spacing(0.5),
							}}
							variant="h4"
						>
							{data.hybridGraph.title}
						</Typography>
						<Typography
							sx={{
								fontSize: '0.75rem',
							}}
							variant="body1"
						>
							{data.hybridGraph.description}
						</Typography>
					</div>
				</Box>
			</StyledCardContent>
		</StyledCard>
	);
}

export default OGPPreview;
