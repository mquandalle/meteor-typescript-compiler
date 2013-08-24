#Meteor Typescript Compiler

## Introduction

TypeScript is a typed super set of JavaScript from Microsoft that compiles to plain JavaScript. It brings strong typing to JavaScript offering classes, modules and interfaces.

TypeScript is supported on both the client and the server. Files ending with `.ts` are automatically compiled to JavaScript.

See [http://www.typescriptlang.org](http://www.typescriptlang.org) for more information.

## Install

* Make sure you have meteorite installed: `npm install -g meteorite`
* From your Meteor project, type `mrt install typescript-compiler`

That's it! From now on, any `*.ts` file is dynamically compiled to javascript (client and server).

## What's included?

* Typescript compiler is the latest and greatest **0.9.1.1**.
* Compiler is used for server & client assets.
* Libraries are not included with the project (ie. lib.d.ts), please bundle them in your project.
* Compilation uses ECMAScript5 generation on the server & ECMAScript3 on the client.
* Full SourceMap support.

## Credits

This project would have never been possible without this project [https://github.com/sinclairzx81/typescript.api](https://github.com/sinclairzx81/typescript.api). All credits go to the author **sinclairzx81** for his clean and easy to use API.

Authored by Olivier Refalo

## Tips

* Never reference a **file.ts**, rather generate a **file.d.ts** and reference this one.
* Prefer Template['todo']['hello'] to Temaplte.todo.hello
* Use Handlers properly

