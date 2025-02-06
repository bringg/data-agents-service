module.exports = {
	extends: '@bringg/eslint-config/be',
	rules: {
		'@typescript-eslint/explicit-module-boundary-types': 'error',
		'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/strict-boolean-expressions': 'error',
		'no-implicit-coercion': 'error',
		eqeqeq: 'error'
	},
	parserOptions: {
		project: ['./tsconfig.json']
	},
	overrides: [
		{
			files: ['*.test.ts'],
			rules: {
				'simple-import-sort/imports': [
					'error',
					{
						groups: [['^(.+)__mocks__'], ['^\\u0000'], ['^@?\\w'], ['^'], ['^\\.']]
					}
				]
			}
		},
		{
			files: ['*.ts'],
			rules: {
				'@typescript-eslint/explicit-member-accessibility': [
					'error',
					{
						accessibility: 'explicit',
						overrides: {
							accessors: 'no-public',
							constructors: 'no-public',
							methods: 'explicit',
							properties: 'no-public',
							parameterProperties: 'explicit'
						}
					}
				],
				'@typescript-eslint/no-unused-vars': [
					'error',
					{
						ignoreRestSiblings: true,
						argsIgnorePattern: '^_'
					}
				]
			}
		}
	]
};
