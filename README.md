#Meteor Typescript Compiler

## Introduction

TypeScript is a typed super set of JavaScript from Microsoft that compiles to plain JavaScript. It brings strong typing to JavaScript offering classes, modules and interfaces.

TypeScript is supported on both the client and the server. Files ending with `.ts` are automatically compiled to JavaScript.

See [http://www.typescriptlang.org](http://www.typescriptlang.org) for more information.

## Install

* From your Meteor project, type `meteor add orefalo:typescript-compiler`

That's it! From now on, all `*.ts` files are dynamically compiled into Javascript (client and server).

## What's included?

* Typescript compiler is the latest and greatest **0.9.1.1**.
* Compiler is used for server & client assets.
* Libraries are not included with the project (ie. lib.d.ts), please bundle them in your project.
* Compilation uses ECMAScript5 generation on the server & ECMAScript3 on the client.
* Full SourceMap support. **Featured disabled for now, issue with the TS compiler**

## Other projects

* You will probably like **meteor.d.ts** at [https://github.com/orefalo/meteor-typescript-libs](https://github.com/orefalo/meteor-typescript-libs)
* Sample demos built around Meteor+TypeScript [https://github.com/orefalo/meteor-typescript-demos](https://github.com/orefalo/meteor-typescript-demos)

## Credits

* This project would have never been possible without this project [https://github.com/sinclairzx81/typescript.api](https://github.com/sinclairzx81/typescript.api). All credits go to the author **sinclairzx81** for his clean and easy to use API.
* Many thanks to [Jason Parekh](https://github.com/jasonparekh) for fixing SourceMaps.
* Authored by [Olivier Refalo](https://github.com/orefalo).
* Optimizations by [Alex Atallah](https://github.com/alexanderatallah).
* Code based from the Meteor coffeescript package

## Tips

* Never reference a **file.ts**, rather generate a **file.d.ts** using `tsc --reference file.ts`.
* Accessing templates can be a little tricky in TypeScript, prefer `Template['todo']['hello']` to `Template.todo.hello`.
* Trying to read a form field value? use `(<HTMLInputElement>evt.target).value`.
* [WebStorm 7](http://www.jetbrains.com/webstorm/) is an excellent IDE for TypeScript and Node web applications in general.

## Updates

May 6 2014 - switched internal compiler to ts-compiler, full support for ts 1.0

