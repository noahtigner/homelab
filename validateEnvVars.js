#!/usr/bin/env node

import validateEnvVars from 'validate-env-vars';
import { z } from 'zod';

const envSchema = z.object({
	SERVER_IP: z.ipv4(),
	LEETCODE_USERNAME: z.string().min(1),
	GITHUB_USERNAME: z.string().min(1),
	OGP_IO_API_KEY: z.string().min(1),
	GA4_PROPERTY_ID: z.string().min(1),
});

validateEnvVars({ schema: envSchema, envPath: '.env' });
