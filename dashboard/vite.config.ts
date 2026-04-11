import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import validateEnvVars from 'validate-env-vars';

import envConfigSchema from './.env.config';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [
		react(),
		tailwindcss(),
		// Skip env validation in test mode
		...(mode !== 'test'
			? [
					{
						name: 'validate-env-vars',
						buildStart: () =>
							validateEnvVars({
								schema: envConfigSchema,
								envPath: './.env',
								logVars: true,
							}),
					},
				]
			: []),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/test/setup.ts',
	},
}));
