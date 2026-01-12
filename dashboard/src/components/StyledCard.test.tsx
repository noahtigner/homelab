import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StyledCard, StyledCardContent } from './StyledCard';

describe('StyledCard', () => {
	it('should render StyledCard with children', () => {
		render(
			<StyledCard>
				<div>Card Content</div>
			</StyledCard>
		);
		expect(screen.getByText('Card Content')).toBeInTheDocument();
	});

	it('should render StyledCardContent with children', () => {
		render(
			<StyledCardContent>
				<div>Card Content Text</div>
			</StyledCardContent>
		);
		expect(screen.getByText('Card Content Text')).toBeInTheDocument();
	});

	it('should render StyledCard with StyledCardContent together', () => {
		render(
			<StyledCard>
				<StyledCardContent>
					<div>Nested Content</div>
				</StyledCardContent>
			</StyledCard>
		);
		expect(screen.getByText('Nested Content')).toBeInTheDocument();
	});
});
