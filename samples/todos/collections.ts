/// <reference path="lib/meteor.d.ts"/>
/// <reference path="collections.d.ts"/>

Todos = new Meteor.Collection<TodoDAO>("todos");
Lists = new Meteor.Collection<ListDAO>("lists");