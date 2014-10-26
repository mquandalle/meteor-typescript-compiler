Package.describe({
  name: "meteortypescript:compiler",
  summary: "TypeScript is a typed superset of JavaScript",
  version: "0.0.11",
  git: "https://github.com/meteor-typescript/meteor-typescript-compiler.git"
});

Package._transitional_registerBuildPlugin({
	name: "compileTypescript",
	use: [],
	sources: [
		'plugin/compile-typescript.js'
	],
	npmDependencies: {"ts-compiler": "2.0.0", "node-persist" : "0.0.2"}
});
