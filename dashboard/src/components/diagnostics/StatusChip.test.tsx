import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusChip from './StatusChip';

describe('StatusChip', () => {
	it('should render with label', () => {
		render(<StatusChip label="Test Service" status="ok" />);
		expect(screen.getByText('Test Service')).toBeInTheDocument();
	});

	it('should render with success color for ok status', () => {
		render(<StatusChip label="Service OK" status="ok" />);
		// Find the chip container - it's a span with chip class
		const chip = screen.getByText('Service OK').closest('span');
		expect(chip).toBeInTheDocument();
		// Check that a class containing 'Success' is applied
		expect(chip?.className).toMatch(/chipSuccess/i);
	});

	it('should render with warning color for warning status', () => {
		render(<StatusChip label="Service Warning" status="warning" />);
		const chip = screen.getByText('Service Warning').closest('span');
		expect(chip).toBeInTheDocument();
		expect(chip?.className).toMatch(/chipWarning/i);
	});

	it('should render with error color for error status', () => {
		render(<StatusChip label="Service Error" status="error" />);
		const chip = screen.getByText('Service Error').closest('span');
		expect(chip).toBeInTheDocument();
		expect(chip?.className).toMatch(/chipError/i);
	});

	it('should render with default color for loading status', () => {
		render(<StatusChip label="Service Loading" status="loading" />);
		const chip = screen.getByText('Service Loading').closest('span');
		expect(chip).toBeInTheDocument();
		// Default status should not have success/warning/error classes
		expect(chip?.className).not.toMatch(/chipSuccess/i);
		expect(chip?.className).not.toMatch(/chipWarning/i);
		expect(chip?.className).not.toMatch(/chipError/i);
	});

	it('should render with link when url is provided', () => {
		render(
			<StatusChip
				label="Service with Link"
				status="ok"
				url="https://example.com"
			/>
		);
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('href', 'https://example.com');
		expect(link).toHaveAttribute('target', '_blank');
	});

	it('should render without link when url is not provided', () => {
		render(<StatusChip label="Service without Link" status="ok" />);
		expect(screen.queryByRole('link')).not.toBeInTheDocument();
	});
});
