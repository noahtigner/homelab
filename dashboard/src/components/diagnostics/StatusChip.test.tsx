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
		const chip = screen.getByText('Service OK').closest('.MuiChip-root');
		expect(chip).toHaveClass('MuiChip-colorSuccess');
	});

	it('should render with warning color for warning status', () => {
		render(<StatusChip label="Service Warning" status="warning" />);
		const chip = screen
			.getByText('Service Warning')
			.closest('.MuiChip-root');
		expect(chip).toHaveClass('MuiChip-colorWarning');
	});

	it('should render with error color for error status', () => {
		render(<StatusChip label="Service Error" status="error" />);
		const chip = screen.getByText('Service Error').closest('.MuiChip-root');
		expect(chip).toHaveClass('MuiChip-colorError');
	});

	it('should render with default color for loading status', () => {
		render(<StatusChip label="Service Loading" status="loading" />);
		const chip = screen
			.getByText('Service Loading')
			.closest('.MuiChip-root');
		expect(chip).toHaveClass('MuiChip-colorDefault');
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
