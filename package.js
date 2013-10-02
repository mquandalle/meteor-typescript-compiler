
Package.describe({
	summary: "Full Typescript (.ts) support for Meteor"
});

Package._transitional_registerBuildPlugin({
	name: "compileTypescript",
	use: [],
	sources: [
		'plugin/compile-typescript.js'
	],
	npmDependencies: {"typescript.api": "0.7.7"}
});
