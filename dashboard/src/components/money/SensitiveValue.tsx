import type { ReactNode } from 'react';

export default function SensitiveValue({
	hidden,
	children,
}: {
	hidden: boolean;
	children: ReactNode;
}) {
	return (
		<span className="relative inline-grid align-baseline">
			<span
				aria-hidden={hidden || undefined}
				className={hidden ? 'invisible select-none' : undefined}
			>
				{children}
			</span>
			{hidden && (
				<span className="pointer-events-none absolute inset-0 overflow-hidden text-right whitespace-nowrap select-none">
					<span aria-hidden="true">••••</span>
					<span className="sr-only">Amount hidden</span>
				</span>
			)}
		</span>
	);
}
