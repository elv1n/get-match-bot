"use strict";

module.exports = {
	env: {
		es6: true,
		node: true
	},
	extends: [ "eslint:recommended"],
	plugins: [ "prettier" ],
	rules: {
		curly: "error",
		"import/no-extraneous-dependencies": [
			"error",
			{ devDependencies: [ "tests*/**", "scripts/**" ] }
		],
		"no-console": "off",
		"no-else-return": "error",
		"no-inner-declarations": "error",
		"no-unneeded-ternary": "error",
		"no-useless-return": "error",
		"no-var": "error",
		"no-tabs": "off",
		"indent": ["error", "tab"],
		"one-var": [ "error", "never" ],
		"prefer-arrow-callback": "error",
		"prefer-const": "error",
		"react/no-deprecated": "off",
		strict: "error",
		"symbol-description": "error",
		yoda: [ "error", "never", { exceptRange: true } ],
		"no-mixed-spaces-and-tabs": [2, "smart-tabs"],
		"no-multiple-empty-lines": 0,
		"array-callback-return": "off",
		"prettier/prettier": [
			"error",
			{
				"singleQuote": true,
				"useTabs": true,
				"tabWidth": 4,
				"trailing-comma": "all"
			}
		]
	},
	"parserOptions": { "ecmaVersion": 6 }
};