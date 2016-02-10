# Meteor Typescript Compiler

## Introduction

TypeScript is a statically typed superset of JavaScript that compiles to plain vanilla JavaScript. The language comes with many additions such as classes, scoping, modules and interfaces. See [http://www.typescriptlang.org](http://www.typescriptlang.org) for more information.

With this meteor plugin, TypeScript files (ending is .ts) are automatically compiled to JavaScript as you start the meteor server.

## What's included?

* Transparent compilation of Typescript assets on the Meteor platform
* Libraries such as **meteor.d.ts** or **node.d.ts** are not bundled with the project, please grab them from [https://github.com/meteor-typescript/meteor-typescript-libs](https://github.com/meteor-typescript/meteor-typescript-libs) or install them with the help of special tools (see below)
* Sample demos built around Meteor+TypeScript can be found in the **samples** folder

## Install

This version of the module supports Meteor 1.2.x and forward.

* From your Meteor project, type `meteor add meteortypescript:compiler`
* Add a `tsconfig.json` at the top of your project (see below)
* That's it! From now on, all `*.ts` files are dynamically compiled into Javascript (client and server)

To learn more:
* Refer to the following [coding guidelines](https://github.com/meteor-typescript/meteor-typescript-libs#usage-collections) for more details about how to use Meteor and TypeScript together
* If you use IDEs like WebStorm, you may be interested to read a [chapter](http://www.angular-meteor.com/tutorials/socially/angular2/folder-structure) from the Angular2-Meteor tutorial about using TypeScript in Meteor projects including integration with IDEs

## tsconfig.json

Except few ones, almost all options are supported from the [original list](https://github.com/Microsoft/TypeScript/wiki/Compiler-Options).
Read up about exceptions [here](https://github.com/barbatus/typescript#compiler-options).

For instance, a valid `tsconfig.json` may look like:

```json
 {
    "compilerOprions": {
      "target": "es5",
      "sourceMap": true,
      "module": "commonjs"
    }
 }
 ```

You may like to use some of the additional options.
Check out them [here](https://github.com/barbatus/ts-compilers#typescript-config).

### Default Module Option

Default TypeScript configuration has `module` set to `system`, which means each file will be compiled to a SystemJS module.
In order to make it work, add `systemjs:systemjs` package to you app or package or remove SystemJS completely setting `module` to `none` in the config file.

## Typings

There are two ways to add typings:

  - to reference a definition file using sugared syntax in any other `ts`-file:

```
  ///<reference path="typings/foo.d.ts" />
```

  - or add typings in the `files` section of the config:

```
  {
    compilerOptions: {
      ...
    },
    files: [
      "typings/foo.d.ts"
    ]
  }
```

> Note: `files` section works only with typings, TypeScript files are just ignored
> since they are passed to the compiler by Meteor anyways.

## Third Party Libraries' Typings

It's recommended to use [`typings`](https://github.com/typings/typings) tool to search and install typings of any third party library.
This tool can search and install typings from multiple global repos including well-known [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped).

For example, to install Meteor typings, just hit:

```
npm install typings -g
typings install meteor --ambient
```

This will add Meteor definition files linked together in the root definition file called `main.d.ts`.
Add `typings/main.d.ts` to your config accordingly:

```
{
   "files": ["typings/main.d.ts"]
}
```

As an alternative, you can use [https://github.com/meteor-typescript/meteor-typescript-libs](https://github.com/meteor-typescript/meteor-typescript-libs) package that contains multiple typigns useful in a Meteor project.

## Credits

* This package is based on [ts-compilers](https://github.com/barbatus/ts-compilers) TypeScript compilers package.

## Updates
* **Feb 10 20016** - TypeScript Compiler updated to the latest version, which notably uses `tsconfig.json` instead of `.tsconfig`.
`tsconfig.json` is now being watched as well as any other `ts`-file, which means, in case of its changes, your project will be recompiled with the new config.
* **Nov 1st 2015** - Compiler module changed to support Meteor 1.2.x
* **Jul 8 2015** - fixed an issue on Windows where zzz.ts-compiler.ts would try and make itself on the C:\ drive if your project was located in My Documents. - Jacob Foster
* **Jul 8 2015** - fixed an issue where tsc could not be found on Windows (must install TypeScript for Visual Studio) - Jacob Foster
* **Feb 22 2015** - support for source maps. comments are now removed from generated files.
* **Feb 17 2015** - typescrypt-compiler v2, batch compilation using tsc - code merged from meteor-tsc, thanks to jason parekh.
* **Oct 26 2014** - Upgraded package to latest atmosphere, fixed issues with caching.
* **March 2014** - meteortypescript organization is now live. please join and contribute.
* **May 6 2014** - switched internal compiler to ts-compiler, full support for ts 1.0.
