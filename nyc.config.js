module.exports = {
	include: ['app/**'],
	exclude: ['app/**/*.test.ts', 'app/**/test/**'],
	'check-coverage': true,
	lines: 30,
	all: true,
	reporter: ['lcov', 'text', 'text-summary'],
	'report-dir': 'coverage'
};
