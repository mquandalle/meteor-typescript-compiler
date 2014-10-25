
Package.describe({
  summary: "Full Typescript (.ts) support for Meteor",
  version: "0.0.2",
  git: "git@github.com:meteor-typescript/meteor-typescript-compiler.git"
});

Package._transitional_registerBuildPlugin({
	name: "compileTypescript",
	use: [],
	sources: [
		'plugin/compile-typescript.js'
	],
	npmDependencies: {"ts-compiler": "2.0.0", "node-persist" : "0.0.2"}

});
