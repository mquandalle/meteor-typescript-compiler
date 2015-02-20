/// <reference path="lib/meteor.d.ts" />
/// <reference path="lib/node.d.ts" />


interface EventsDAO {
    text: string;
    createdAt: Date;
}

declare var Events:Mongo.Collection<EventsDAO>;
Events = new Mongo.Collection<EventsDAO>('events');

if (Meteor.isClient) {
    // This code only runs on the client
    Template.body.helpers({
        events: function () {
            return Events.find({});
        }
    });


    Template.body.events({
        "click .container": function () {

            // This function is called when the new task form is submitted
            var text:string = "" + Math.random();

            Events.insert({
                text: text,
                createdAt: new Date() // current time
            });

            // Prevent default form submit
            return false;
        }
    });

}

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.startup(function () {
        // code to run on server at startup
        console.log("Server is saying, Helloworld in TypeScript");
    });
}
