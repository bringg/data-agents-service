module.exports = {
	require: [
		'./test/setup/mocha-env.js',
		'./test/setup/setup-test.ts',
		'./test/setup/chai.ts',
		'./test/setup/mocha-roothooks.ts'
	],
	extension: 'ts',
	reporter: 'mocha-multi-reporters',
	'reporter-options': 'configFile=mocha-multi-reporter-config.json',
	timeout: 15000,
	recursive: true,
	exit: true
};
