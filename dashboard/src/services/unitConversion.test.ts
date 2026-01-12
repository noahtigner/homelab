import { describe, it, expect } from 'vitest';
import {
	celsiusToFahrenheit,
	bytesToGigabytes,
	bytesToTerabytes,
} from './unitConversion';

describe('unitConversion', () => {
	describe('celsiusToFahrenheit', () => {
		it('should convert 0°C to 32°F', () => {
			expect(celsiusToFahrenheit(0)).toBe(32);
		});

		it('should convert 100°C to 212°F', () => {
			expect(celsiusToFahrenheit(100)).toBe(212);
		});

		it('should convert -40°C to -40°F', () => {
			expect(celsiusToFahrenheit(-40)).toBe(-40);
		});

		it('should convert 37°C to 98.6°F', () => {
			expect(celsiusToFahrenheit(37)).toBeCloseTo(98.6);
		});
	});

	describe('bytesToGigabytes', () => {
		it('should convert 1,000,000,000 bytes to 1 GB', () => {
			expect(bytesToGigabytes(1e9)).toBe(1);
		});

		it('should convert 0 bytes to 0 GB', () => {
			expect(bytesToGigabytes(0)).toBe(0);
		});

		it('should convert 5,000,000,000 bytes to 5 GB', () => {
			expect(bytesToGigabytes(5e9)).toBe(5);
		});

		it('should handle decimal values', () => {
			expect(bytesToGigabytes(1.5e9)).toBe(1.5);
		});
	});

	describe('bytesToTerabytes', () => {
		it('should convert 1,000,000,000,000 bytes to 1 TB', () => {
			expect(bytesToTerabytes(1e12)).toBe(1);
		});

		it('should convert 0 bytes to 0 TB', () => {
			expect(bytesToTerabytes(0)).toBe(0);
		});

		it('should convert 3,000,000,000,000 bytes to 3 TB', () => {
			expect(bytesToTerabytes(3e12)).toBe(3);
		});

		it('should handle decimal values', () => {
			expect(bytesToTerabytes(2.5e12)).toBe(2.5);
		});
	});
});
