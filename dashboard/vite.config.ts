import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import validateEnvVars from 'validate-env-vars';

import envConfigSchema from './.env.config';

process.loadEnvFile('../.env');

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		{
			name: 'validate-env-vars',
			buildStart: () =>
				validateEnvVars({
					schema: envConfigSchema,
					envPath: './.env',
					logVars: true,
				}),
		},
	],
});
