import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { z } from 'zod';
import validateEnvVars from 'validate-env-vars';

import envConfigSchema from './env.config';

declare global {
	type Env = z.infer<typeof envConfigSchema>;
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		{
			name: 'validate-env-vars',
			buildStart: () => validateEnvVars({ schema: envConfigSchema }),
		},
	],
});
