/// <reference path="lib/meteor.d.ts"/>
/// <reference path="collections.d.ts"/>

Todos = new Mongo.Collection<TodoDAO>("todos");
Lists = new Mongo.Collection<ListDAO>("lists");