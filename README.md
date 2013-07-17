#Meteor Typescript Compiler

## Introduction

TypeScript is a typed superset of JavaScript from Microsoft that compiles to plain JavaScript. It brings strong typing to JavaScript offering classes, modules and interfaces.

TypeScript is supported on both the client and the server. Files ending with `.ts` are automatically compiled to JavaScript.

See [http://www.typescriptlang.org](http://www.typescriptlang.org) for more information.

## Rebuild typescript sources

1. git clone https://git01.codeplex.com/typescript 
2. cd typescript
3. git checkout develop 
4. npm install 
5. ./node_modules/.bin/jake local 
6. cd built/local
7. get **typescript.js** and **lib.d.ts**
8. adjust typescipt.js and add npm wrappers