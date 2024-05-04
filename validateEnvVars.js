#!/usr/bin/env node

import validateEnvVars, {
	envObject,
	envString,
	envNonEmptyString,
} from 'validate-env-vars';

const envSchema = envObject({
	PIHOLE_IP: envString().ip(),
	SERVER_IP: envString().ip(),
	LEETCODE_USERNAME: envNonEmptyString(),
	GITHUB_USERNAME: envNonEmptyString(),
	OGP_IO_API_KEY: envNonEmptyString(),
	GA4_PROPERTY_ID: envNonEmptyString(),
});

validateEnvVars({ schema: envSchema });
