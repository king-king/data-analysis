/**
 * Created by wangqun6 on 2017/6/1.
 */
// 得到数据库中每个页面的访问数量

let MongoClient = require('mongodb').MongoClient;
let fs = require('fs');
let task = require('../../lib/task');
let url = require('url');

let w = fs.createWriteStream('../../important/pageCount.js', {flags: 'w'});

MongoClient.connect('mongodb://127.0.0.1:27017/analysis', function (err, db) {
    if (err) {
        console.log('数据库连接失败', err);
    }
    else {
        console.log('连接成功');
        let col = db.collection('visit');
        let ttt = Date.now();
        col.aggregate([
            {
                $match: {
                    PC: true
                }
            },
            {
                $project: {
                    page: '$page'
                }
            },
            {
                $group: {
                    _id: '$page',
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
        ], function (err, arr) {
            if (err) {
                console.log(err);
            }
            else {
                console.log('压缩前' + arr.length);
                let obj = {};
                arr.forEach(function (d) {
                    if (d) {
                        let u = url.parse(d['_id']);
                        let key = u.hostname + u.pathname;
                        if (obj[key] !== undefined) {
                            obj[key] += d.count;
                        } else {
                            obj[key] = d.count;
                        }
                    }
                });
                let result = [];
                for (let key in obj) {
                    result.push({
                        count: obj[key],
                        name: key
                    });
                }
                result.sort(function (a, b) {
                    return b.count - a.count;
                });
                w.write(JSON.stringify(result));
                w.end();
                console.log(`共花费${(Date.now() - ttt) / 1000}s`, result.length);
                db.close();
            }
        });


    }
});
