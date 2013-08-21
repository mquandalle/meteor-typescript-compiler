
Package.describe({
	summary: "Full Typescript support for Meteor: client/server/sourcemaps"
});

Package._transitional_registerBuildPlugin({
	name: "compileTypescript",
	use: [],
	sources: [
		'plugin/compile-typescript.js'
	],
	npmDependencies: {"typescript.api": "0.7.3"}
});

//Package.on_test(function (api) {
//	api.use(['typescript-compiler', 'tinytest']);
//	api.use(['coffeescript-test-helper'], ['client', 'server']);
//	api.add_files([
//		'coffeescript_test_setup.js',
//		'coffeescript_tests.coffee',
//		'coffeescript_strict_tests.coffee',
//		'litcoffeescript_tests.litcoffee',
//		'coffeescript_tests.js'
//	], ['client', 'server']);
//});

