import {
	envObject,
	envNonEmptyString,
	envString,
	envEnum,
} from 'validate-env-vars';

const envConfigSchema = envObject({
	NODE_ENV: envEnum(['development', 'production', 'test']),
	VITE_API_BASE: envString().url(),
	VITE_PIHOLE_IP: envString().ip(),
	VITE_TRAEFIK_BASE: envString().url(),
	VITE_LEETCODE_USERNAME: envNonEmptyString(),
	VITE_GITHUB_USERNAME: envNonEmptyString(),
});

export default envConfigSchema;
