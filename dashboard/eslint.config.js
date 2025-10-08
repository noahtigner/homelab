import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import importXPlugin from 'eslint-plugin-import-x';
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
});

export default [
	{
		ignores: ['dist/**', 'node_modules/**', 'eslint.config.js'],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...tanstackQueryPlugin.configs['flat/recommended'],
	reactPlugin.configs.flat.recommended,
	...reactHooksPlugin.configs.recommended,
	...compat.extends('plugin:jsx-a11y/recommended'),
	prettierConfig,
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		plugins: {
			'import-x': importXPlugin,
			'react-refresh': reactRefreshPlugin,
			prettier: prettierPlugin,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			'react/react-in-jsx-scope': 'off',
			'react/jsx-props-no-spreading': 'off',
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			'prettier/prettier': 'error',
			// Import rules - basic ones that don't require TypeScript resolution
			'import-x/no-duplicates': 'warn',
			'import-x/first': 'error',
			'import-x/newline-after-import': 'warn',
			'import-x/no-named-default': 'error',
		},
	},
];
