/// <reference path=".meteor/local/build/programs/server/assets/packages/meteortypescript_typescript-libs/definitions/meteor.d.ts" />
/// <reference path="collections.d.ts"/>

Todos = new Mongo.Collection<TodoDAO>("todos");
Lists = new Mongo.Collection<ListDAO>("lists");