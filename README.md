#Meteor Typescript Compiler

## Introduction

TypeScript is a typed super set of JavaScript from Microsoft that compiles to plain JavaScript. It brings strong typing to JavaScript offering classes, modules and interfaces.

TypeScript is supported on both the client and the server. Files ending with `.ts` are automatically compiled to JavaScript.

See [http://www.typescriptlang.org](http://www.typescriptlang.org) for more information.

## Install

* From your Meteor project, type `meteor add meteortypescript:compiler`

That's it! From now on, all `*.ts` files are dynamically compiled into Javascript (client and server).

## What's included?

* Typescript compiler is the latest and greatest **1.x**
* Compiler is used for server & client assets
* Compilation uses ECMAScript5 generation on the server & ECMAScript3 on the client
* Libraries are not included with the project (ie. lib.d.ts), please bundle them in your project

## Other projects

* You will probably like **meteor.d.ts** at [https://github.com/meteor-typescript/meteor-typescript-libs](https://github.com/meteor-typescript/meteor-typescript-libs)
* Sample demos built around Meteor+TypeScript can be found in the **samples** folder

## Credits

* This project would have never been possible without this project [https://github.com/jedmao/ts-compiler](https://github.com/jedmao/ts-compiler). All credits go to the author **sinclairzx81** for his clean and easy to use API.
* Authored by [Olivier Refalo](https://github.com/orefalo).
* Optimizations by [Alex Atallah](https://github.com/alexanderatallah).
* Code based from the Meteor coffeescript package

## TypeScript/Meteor coding style

* Please refer to the [coding style section](https://github.com/meteor-typescript/meteor-typescript-libs#usage-collections)

## Updates

* **Oct 26 2014** - Upgraded package to latest atmosphere, fixed issues with caching
* **March 2014** - meteortypescript organization is now live. please join and contribute
* **May 6 2014** - switched internal compiler to ts-compiler, full support for ts 1.0

