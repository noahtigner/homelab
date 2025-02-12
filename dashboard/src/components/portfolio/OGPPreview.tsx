import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Box, Skeleton, Typography, useTheme } from '@mui/material';
import { StyledCard, StyledCardContent } from '../StyledCard';

// TODO: type response

function OGPPreview({ url }: { url: string }) {
	const theme = useTheme();

	const { isPending, error, data } = useQuery({
		queryKey: ['ogpPreview'],
		queryFn: () => axios.get(`/portfolio/ogp/`).then((res) => res.data),
		retry: false,
	});

	if (isPending || error || data === null) {
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
						<Typography
							sx={{
								fontSize: '2rem',
								marginBottom: theme.spacing(0.5),
							}}
							variant="h3"
						>
							OGP Preview
						</Typography>
						<div>
							{error ? (
								<>
									<Typography
										sx={{
											fontSize: '1rem',
											marginBottom: theme.spacing(0.5),
										}}
										variant="h4"
									>
										An unexpected error occurred
									</Typography>
									<Typography
										sx={{
											fontSize: '0.75rem',
										}}
										variant="body1"
									>
										{error.message}
									</Typography>
								</>
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
				<a
					href={url}
					target="_blank"
					rel="noreferrer"
					style={{
						all: 'unset',
						textDecoration: 'none',
						height: 100,
					}}
				>
					<img
						src={data.hybridGraph.image}
						alt={data.hybridGraph.title}
						width={100}
						style={{
							display: 'block',
						}}
					/>
				</a>
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
						OGP Preview
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
