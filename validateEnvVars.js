#!/usr/bin/env node

import validateEnvVars, {
	envObject,
	envString,
	envNonEmptyString,
} from 'validate-env-vars';

const envSchema = envObject({
	SERVER_IP: envString().ipv4(),
	LEETCODE_USERNAME: envNonEmptyString(),
	GITHUB_USERNAME: envNonEmptyString(),
	OGP_IO_API_KEY: envNonEmptyString(),
	GA4_PROPERTY_ID: envNonEmptyString(),
});

validateEnvVars({ schema: envSchema });
