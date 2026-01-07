import { z } from 'zod';

const envConfigSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']),
	VITE_API_BASE: z.url(),
	VITE_SERVER_IP: z.ipv4(),
	VITE_TRAEFIK_BASE: z.url(),
	VITE_LEETCODE_USERNAME: z.string().min(1),
	VITE_GITHUB_USERNAME: z.string().min(1),
});

declare global {
	type Env = z.output<typeof envConfigSchema>;
}

export default envConfigSchema;
