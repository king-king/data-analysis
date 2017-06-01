/**
 * Created by wangqun6 on 2017/6/1.
 */

let MongoClient = require('mongodb').MongoClient;
let fs = require('fs');


MongoClient.connect('mongodb://127.0.0.1:27017/analysis', function (err, db) {
    if (err) {
        console.log('数据库连接失败', err);
    }
    else {
        console.log('连接成功');
        let t0 = Date.now();
        let col = db.collection('visit');
        col.createIndex('wtime', function (err, indexName) {
            if (err) {
                console.log(err);
            } else {
                console.log(`spend ${Date.now() - t0} s`);
                console.log(indexName);
            }
            db.close();
        });
    }
});
