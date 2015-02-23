/// <reference path="lib/meteor.d.ts" />

interface TodoDAO {
    _id?: string;
    done?: boolean;
    text: string;
    tags: string[];
    list_id: string;
    timestamp: number;
}
declare var Todos:Mongo.Collection<TodoDAO>;

interface ListDAO {
    _id?: string;
    name: string;
}

declare var Lists:Mongo.Collection<ListDAO>;
