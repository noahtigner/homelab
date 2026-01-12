import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import validateEnvVars from 'validate-env-vars';

import envConfigSchema from './.env.config';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [
		react(),
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
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/test/setup.ts',
	},
}));
