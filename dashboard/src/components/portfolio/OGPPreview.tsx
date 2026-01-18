import { Box, Skeleton, Typography } from '../ui';
import { StyledCard, StyledCardContent } from '../StyledCard';
import { useOGPPreview } from '../../hooks/useOGPPreview';

function OGPPreview({ url }: { url: string }) {
	const { isPending, error, data } = useOGPPreview();

	if (isPending || error || data === null) {
		return (
			<StyledCard>
				<StyledCardContent
					style={{
						display: 'flex',
						flexDirection: 'row',
						gap: 'calc(var(--spacing-unit) * 2)',
					}}
				>
					<Skeleton variant="rectangular" width={100} height={100} />
					<Box
						display="flex"
						flexDirection="column"
						justifyContent="space-between"
					>
						<Typography
							style={{
								fontSize: '2rem',
								marginBottom: 'calc(var(--spacing-unit) * 0.5)',
							}}
							variant="h3"
						>
							OGP Preview
						</Typography>
						<div>
							{error ? (
								<>
									<Typography
										style={{
											fontSize: '1rem',
											marginBottom:
												'calc(var(--spacing-unit) * 0.5)',
										}}
										variant="h4"
									>
										An unexpected error occurred
									</Typography>
									<Typography
										style={{ fontSize: '0.75rem' }}
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
		<StyledCard>
			<StyledCardContent
				style={{
					display: 'flex',
					flexDirection: 'row',
					gap: 'calc(var(--spacing-unit) * 2)',
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
					display="flex"
					flexDirection="column"
					justifyContent="space-between"
				>
					<Typography
						style={{
							fontSize: '2rem',
							marginBottom: 'calc(var(--spacing-unit) * 0.5)',
						}}
						variant="h3"
					>
						OGP Preview
					</Typography>
					<div>
						<Typography
							style={{
								fontSize: '1rem',
								marginBottom: 'calc(var(--spacing-unit) * 0.5)',
							}}
							variant="h4"
						>
							{data.hybridGraph.title}
						</Typography>
						<Typography
							style={{ fontSize: '0.75rem' }}
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
