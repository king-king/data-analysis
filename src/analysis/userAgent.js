/**
 * Created by wangqun6 on 2017/6/1.
 *
 * 统计浏览器信息
 *
 */

let MongoClient = require('mongodb').MongoClient;
let fs = require('fs');
let writer = fs.createWriteStream('../../log/userAgent.js', {flags: 'a'});

MongoClient.connect('mongodb://127.0.0.1:27017/analysis', function (err, db) {
    if (err) {
        console.log('数据库连接失败', err);
    }
    else {
        console.log('连接成功');
        let col = db.collection('visit');
        let t0 = Date.now();
        col.aggregate([
            {
                $match: {
                    PC: true
                }
            },
            {
                $group: {
                    _id: '$userAgent',
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ], function (err, result) {
            if (err) {
                console.log(err)
            } else {
                console.log(`共花费${(Date.now() - t0) / 1000}s`);
                console.log(result.length);
                writer.write(JSON.stringify(result));
                writer.end();
            }
            db.close();
        });


    }
});
