/**
 * Created by wangqun6 on 2017/5/29.
 */
let MongoClient = require('mongodb').MongoClient,
    test = require('assert');
MongoClient.connect('mongodb://localhost:27017/test', function (err, db) {
    // Get the collection
    let col = db.collection('insert_many_with_promise');
    col.insertMany([{a: 1}, {a: 2}],function (r) {

    });
});