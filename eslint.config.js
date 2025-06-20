// eslint.config.js
import tseslint from "typescript-eslint";
import eslintPlugin from "@eslint/js";

export default [
	{
		ignores: ["node_modules/", "main.js"]
	},
	eslintPlugin.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				sourceType: "module",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint.plugin,
		},
		rules: {
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
			"@typescript-eslint/ban-ts-comment": "off",
			"no-prototype-builtins": "off",
			"@typescript-eslint/no-empty-function": "off"
		},
	}
];
