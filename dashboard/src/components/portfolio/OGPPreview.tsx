import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOGPPreview } from '../../hooks/useOGPPreview';

function OGPPreview({ url }: { url: string }) {
	const { isPending, error, data } = useOGPPreview();

	if (isPending || error || data === null) {
		return (
			<Card>
				<CardContent className="flex flex-row gap-4">
					<Skeleton className="h-[100px] w-[100px] shrink-0" />
					<div className="flex min-w-0 flex-col justify-between">
						<h3 className="mb-1 text-xl">OGP Preview</h3>
						<div>
							{error ? (
								<>
									<h4 className="mb-1 text-base">
										An unexpected error occurred
									</h4>
									<p className="text-xs">{error.message}</p>
								</>
							) : (
								<>
									<Skeleton className="h-5 w-full max-w-[300px]" />
									<Skeleton className="mt-1 h-5 w-full max-w-[500px]" />
								</>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardContent className="flex flex-row gap-4">
				<a
					href={url}
					target="_blank"
					rel="noreferrer"
					className="h-[100px] shrink-0"
				>
					<img
						src={data.hybridGraph.image}
						alt={data.hybridGraph.title}
						width={100}
						height={100}
						className="block rounded"
					/>
				</a>
				<div className="flex min-w-0 flex-col justify-between">
					<h2 className="mb-1 text-xl">{data.hybridGraph.title}</h2>
					<p className="text-sm text-muted-foreground">
						{data.hybridGraph.description}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

export default OGPPreview;
