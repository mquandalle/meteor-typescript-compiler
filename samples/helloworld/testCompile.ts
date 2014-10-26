/// <reference path="lib/meteor.d.ts" />
/// <reference path="lib/node.d.ts" />

if (Meteor.isClient) {
    Template['hello'].helpers({
        'greeting': function () {
            return "HelloWorld Metor+TypeScript.";
        }
    });

    Template['hello'].events({
        'click input': function () {
            // template data, if any, is available in 'this'
            if (typeof console !== 'undefined')
                console.log("You pressed the button");
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
        console.log("Server is saying, Helloworld in TypeScript");
    });
}
