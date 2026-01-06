import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginNext from "@next/eslint-plugin-next";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		ignores: [".next/*", "node_modules/*", "dist/*", "out/*"],
	},

	js.configs.recommended,

	...tseslint.configs.recommended,

	{
		plugins: {
			"@next/next": pluginNext,
		},
		rules: {
			...pluginNext.configs.recommended.rules,
			...pluginNext.configs["core-web-vitals"].rules,
		},
	},

	{
		files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			"react/react-in-jsx-scope": "off",
		},
	},
]);
