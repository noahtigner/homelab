import { z } from 'zod';

const nonEmptyString = z
	.string()
	.min(1, { message: 'String cannot be empty' })
	.refine((val) => val != 'undefined', {
		message: `String cannot equal 'undefined'`,
	});

const envConfigSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']),
	VITE_API_BASE: z.string().url(),
	VITE_LEETCODE_USERNAME: nonEmptyString,
	VITE_GITHUB_USERNAME: nonEmptyString,
});

declare global {
	type Env = z.infer<typeof envConfigSchema>;
}

export default envConfigSchema;
