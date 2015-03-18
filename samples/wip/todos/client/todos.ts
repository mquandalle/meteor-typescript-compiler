///<reference path="../.meteor/local/build/programs/server/assets/packages/meteortypescript_typescript-libs/definitions/meteor.d.ts" />
///<reference path="../.meteor/local/build/programs/server/assets/packages/meteortypescript_typescript-libs/definitions/backbone.d.ts"/>
///<reference path="../.meteor/local/build/programs/server/assets/packages/meteortypescript_typescript-libs/definitions/underscore.d.ts"/>
///<reference path="../collections.d.ts"/>

// Client-side JavaScript, bundled and sent to client.

// Define Minimongo collections to match server/publish.js.

// ID of currently selected list
Session.setDefault('list_id', null);

// Name of currently selected tag for filtering
Session.setDefault('tag_filter', null);

// When adding tag to a todo, ID of the todo
Session.setDefault('editing_addtag', null);

// When editing a list name, ID of the list
Session.setDefault('editing_listname', null);

// When editing todo text, ID of the todo
Session.setDefault('editing_itemname', null);

// Subscribe to 'lists' collection on startup.
// Select a list once data has arrived.
var listsHandle = Meteor.subscribe('lists', function () {
    if (!Session.get('list_id')) {
        var list:ListDAO = Lists.findOne({}, {sort: {name: 1}});
        if (list)
            Router.setList(list._id);
    }
});

var todosHandle = null;
// Always be subscribed to the todos for the selected list.
Tracker.autorun(function () {
    var list_id = Session.get('list_id');
    if (list_id)
        todosHandle = Meteor.subscribe('todos', list_id);
    else
        todosHandle = null;
});

////////// Helpers for in-place editing //////////

// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
//	events(eventMap: {[id:string]: Function}): void;

var okCancelEvents = function (selector:string, callbacks):{[id:string]: Function} {
    var ok:Function = callbacks.ok || function () {
        };
    var cancel:Function = callbacks.cancel || function () {
        };

    var eventMap:{[id:string]: Function} = {};
    eventMap['keyup ' + selector + ', keydown ' + selector + ', focusout ' + selector] =
        function (evt:KeyboardEvent) {
            if (evt.type === "keydown" && evt.which === 27) {
                // escape = cancel
                cancel.call(this, evt);

            } else if (evt.type === "keyup" && evt.which === 13 ||
                evt.type === "focusout") {
                // blur/return/enter = ok/submit if non-empty
                var value:string = String((<HTMLInputElement>evt.target).value || "");
                if (value)
                    ok.call(this, value, evt);
                else
                    cancel.call(this, evt);
            }
        };

    return eventMap;
};

var activateInput:Function = function (input) {
    input.focus();
    input.select();
};

////////// Lists //////////

Template['lists'].helpers({

    'loading': function () {
        return !listsHandle.ready();
    },
    'lists': function () {
        return Lists.find({}, {sort: {name: 1}});
    }
});

Template['lists'].events({

    'mousedown .list': function () {
        // select list
        Router.setList(this._id);
    },

    'click .list': function (evt) {
        // prevent clicks on <a> from refreshing the page.
        evt.preventDefault();
    },

    'dblclick .list': function (evt, template:Blaze.TemplateInstance) { // start editing list name
        Session.set('editing_listname', this._id);
        Tracker.flush(); // force DOM redraw, so we can focus the edit field
        activateInput(template.find("#list-name-input"));
    }

});

// Attach events to keydown, keyup, and blur on "New list" input box.
Template['lists'].events(okCancelEvents(
    '#new-list',
    {
        ok: function (text:string, evt) {
            console.log(text);
            var id = Lists.insert({name: text});
            Router.setList(id);
            (<HTMLInputElement>evt.target).value = "";
        }
    }));

Template['lists'].events(okCancelEvents(
    '#list-name-input',
    {
        ok: function (value) {
            Lists.update(this._id, {$set: {name: value}});
            Session.set('editing_listname', null);
        },
        cancel: function () {
            Session.set('editing_listname', null);
        }
    }));

Template['lists'].helpers({

    'selected': function ():string {
        return Session.equals('list_id', this._id) ? 'selected' : '';
    },

    'name_class': function ():string {
        return this.name ? '' : 'empty';
    },

    'editing': function ():boolean {
        return Session.equals('editing_listname', this._id);
    }

});


////////// Todos //////////

Template['todos'].helpers({

    'loading': function ():boolean {
        return todosHandle && !todosHandle.ready();
    },

    'any_list_selected': function ():boolean {
        return !Session.equals('list_id', null);
    },

    'todos': function ():Mongo.Cursor<TodoDAO> {
        // Determine which todos to display in main pane,
        // selected based on list_id and tag_filter.

        var list_id = Session.get('list_id');
        if (!list_id)
            return <Mongo.Cursor<TodoDAO>>{};

        var selector:any = {list_id: list_id};
        var tag_filter = Session.get('tag_filter');
        if (tag_filter)
            selector.tags = tag_filter;

        return Todos.find(selector, {sort: {timestamp: 1}});
    }

});


Template['todos'].events(okCancelEvents(
    '#new-todo',
    {
        ok: function (text:string, evt:Meteor.Event) {
            var tag:string = Session.get('tag_filter');
            Todos.insert({
                text: text,
                list_id: <string>Session.get('list_id'),
                done: false,
                timestamp: <number> (new Date()).getTime(),
                tags: tag ? <string[]>[tag] : []
            });
            (<HTMLInputElement>evt.target).value = "";
        }
    }));


Template['todo_item'].helpers({
    'tag_objs': function () {
        var todo_id = this._id;
        return _.map(this.tags || [], function (tag) {
            return {todo_id: todo_id, tag: tag};
        });
    },
    'done_class': function ():string {
        return this.done ? 'done' : '';
    },
    'done_checkbox': function ():string {
        return this.done ? 'checked="checked"' : '';
    },
    '.editing': function ():boolean {
        return Session.equals('editing_itemname', this._id);
    },
    'adding_tag': function ():boolean {
        return Session.equals('editing_addtag', this._id);
    }

});


//em = <Meteor.EventMap>{};

Template['todo_item'].events({
    'click .check': function () {
        Todos.update(this._id, {$set: {done: !this.done}});
    },

    'click .destroy': function () {

        Todos.remove(this._id);
    },

    'click .addtag': function (evt, tmpl:Blaze.TemplateInstance) {
        Session.set('editing_addtag', this._id);
        Tracker.flush(); // update DOM before focus
        activateInput(tmpl.find("#edittag-input"));
    },

    'dblclick .display .todo-text': function (evt, tmpl:Blaze.TemplateInstance) {
        Session.set('editing_itemname', this._id);
        Tracker.flush();
        // update DOM before focus
        activateInput(tmpl.find("#todo-input"));
    },
    'click .remove': function (evt) {
        var tag = this.tag;
        var id = this.todo_id;
        Todos.update({_id: id}, {$pull: {tags: tag}});
    }

});

Template['todo_item'].events(okCancelEvents(
    '#todo-input',
    {
        ok: function (value) {
            Todos.update(this._id, {$set: {text: value}});
            Session.set('editing_itemname', null);
        },
        cancel: function () {
            Session.set('editing_itemname', null);
        }
    }));

Template['todo_item'].events(okCancelEvents(
    '#edittag-input',
    {
        ok: function (value) {
            Todos.update(this._id, {$addToSet: {tags: value}});
            Session.set('editing_addtag', null);
        },
        cancel: function () {
            Session.set('editing_addtag', null);
        }
    }));

////////// Tag Filter //////////

interface TagInfo {
    tag: string;
    count: number;
}


// Pick out the unique tags from all todos in current list.
Template['tag_filter'].helpers({

    'tags': function () {
        var tag_infos:Array<TagInfo> = [];
        var total_count = 0;

        Todos.find({list_id: Session.get('list_id')}).forEach(function (todo) {
            _.each(todo.tags, function (tag:string) {
                var tag_info = _.find(tag_infos, function (x) {
                    return x.tag === tag;
                });
                if (!tag_info)
                    tag_infos.push({tag: tag, count: 1});
                else
                    tag_info.count++;
            });
            total_count++;
        });

        tag_infos = _.sortBy(tag_infos, function (x) {
            return x.tag;
        });
        tag_infos.unshift({tag: null, count: total_count});

        return tag_infos;
    },

    'tag_text': function () {
        return this.tag || "All items";
    },
    'selected': function () {
        return Session.equals('tag_filter', this.tag) ? 'selected' : '';
    }

});


Template['tag_filter'].events({
    'mousedown .tag': function () {
        if (Session.equals('tag_filter', this.tag))
            Session.set('tag_filter', null);
        else
            Session.set('tag_filter', this.tag);
    }
});

////////// Tracking selected list in URL //////////

class TodosRouter extends Backbone.Router
{
    //routes() {
    //    ":list_id": "main"
    //}

    main(list_id) {
        var oldList = Session.get("list_id");
        if (oldList !== list_id) {
            Session.set("list_id", list_id);
            Session.set("tag_filter", null);
        }
    }

    setList(list_id) {
        this.navigate(list_id, true);
    }
}

var Router = new TodosRouter;

Meteor.startup(function () {
    Backbone.history.start({pushState: true});
});
