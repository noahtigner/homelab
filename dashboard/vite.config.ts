import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// eslint-disable-next-line import/no-unresolved
import validateEnvVars from 'validate-env-vars';

import envConfigSchema from './env.config';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		{
			name: 'validate-env-vars',
			buildStart: () => validateEnvVars(envConfigSchema),
		},
	],
});
