/**
 * Created by wangqun6 on 2017/6/1.
 */

// 查找时间范围

let MongoClient = require('mongodb').MongoClient;
let fs = require('fs');

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
                    _id: '$id',
                    maxTime: {
                        $max: '$wtime'
                    },
                    minTime: {
                        $min: '$wtime'
                    }
                }
            }
        ], function (err, result) {
            if (err) {
                console.log(err)
            } else {
                console.log(`共花费${(Date.now() - t0) / 1000}s`);
                console.log(result, result.length);
                let maxTime = result[0].maxTime;
                let minTime = result[0].minTime;
            }
            db.close();
        });


    }
});
