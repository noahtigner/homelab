#!/usr/bin/env node

import validateEnvVars, {
	envObject,
	envString,
	envNonEmptyString,
} from 'validate-env-vars';

const envSchema = envObject({
	IP: envString().ip(),
	LEETCODE_USERNAME: envNonEmptyString(),
	GITHUB_USERNAME: envNonEmptyString(),
});

validateEnvVars({ schema: envSchema });
