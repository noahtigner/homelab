import { z } from 'zod';
import {
	envObject,
	envNonEmptyString,
	envString,
	envEnum,
} from 'validate-env-vars';

const envConfigSchema = envObject({
	NODE_ENV: envEnum(['development', 'production', 'test']),
	VITE_API_BASE: envString().url(),
	VITE_LEETCODE_USERNAME: envNonEmptyString(),
	VITE_GITHUB_USERNAME: envNonEmptyString(),
});

declare global {
	type Env = z.infer<typeof envConfigSchema>;
}

export default envConfigSchema;
