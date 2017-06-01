/**
 * Created by wangqun6 on 2017/6/1.
 */
// 得到每小时的数据，每个页面的数据

let MongoClient = require('mongodb').MongoClient;
let fs = require('fs');
let task = require('../../lib/task');
let url = require('url');


let w = fs.createWriteStream('../../log/out.js', {flags: 'w'});
let errlog = fs.createWriteStream('../../log/err.js', {flags: 'w'});

MongoClient.connect('mongodb://127.0.0.1:27017/analysis', function (err, db) {
    if (err) {
        console.log('数据库连接失败', err);
    }
    else {
        console.log('连接成功');
        let col = db.collection('visit');
        //{  maxTime: '1496247908942', minTime: '1495698816629' }
        let maxTime = 1496247908942,
            minTime = 1495698816629,
            diff = maxTime - minTime,
            oneHour = 1000 * 60 * 60;

        let cursor = new Date(minTime);
        cursor.setMinutes(0);
        cursor.setSeconds(0);
        cursor = cursor.getTime();
        let end = cursor + oneHour;
        let jobs = [];


        function getFullTime(t) {
            let s = new Date(t);
            return `${s.getMonth() + 1}/${s.getDate()} ${s.getHours()}:${s.getMinutes()}:${s.getSeconds()}`;
        }

        while (end < maxTime) {
            let s = cursor, e = end;
            jobs.push(function (done) {
                col.aggregate([
                    {
                        $match: {
                            PC: true,
                            wtime: {
                                $gte: s.toString(),// 大于等于
                                $lt: e.toString()// 小于
                            }
                        }
                    },
                    {
                        $project: {
                            wtime: '$wtime',
                            st: '$st',
                            wt: '$wt',
                            bt: '$bt',
                            jt: '$jt',
                            page: '$page'
                        }
                    },
                    {
                        $group: {
                            _id: '$page',
                            count: {
                                $sum: 1
                            },
                            wt: {
                                $push: '$wt'
                            },
                            bt: {
                                $push: '$bt'
                            },
                            jt: {
                                $push: '$jt'
                            },
                            st: {
                                $push: '$st'
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
                        console.log(err);
                        console.log(`${getFullTime(s)} 至 ${getFullTime(e)} 失败`);
                        errlog.write(`===========================\n${getFullTime(s)} 至 ${getFullTime(e)} 失败` + JSON.stringify(err) + '\n===========================');
                    }
                    else {
                        let sum = 0;
                        result.forEach(function (d) {
                            sum += d.count;
                        });

                        // 去重
                        let re = {};
                        result.forEach(function (re) {
                            let u = url.parse(re['_id']);
                            let key = u.hostname + u.pathname;
                            if (re[key] !== undefined) {
                                re[key].count += re.count;
                                re[key].wt = re[key].wt.concat(re.wt);
                                re[key].st = re[key].st.concat(re.st);
                                re[key].jt = re[key].jt.concat(re.jt);
                                re[key].bt = re[key].bt.concat(re.bt);
                            }
                            else {
                                re[key] = {
                                    count: re.count,
                                    wt: re.wt,
                                    st: re.st,
                                    jt: re.jt,
                                    bt: re.bt
                                };
                            }
                        });

                        let log = {
                            result: re,
                            start: s,
                            end: e,
                            sum: sum
                        };
                        w.write(JSON.stringify(log) + '\n');
                        console.log(`${getFullTime(s)} 至 ${getFullTime(e)} 完毕 ${(e - minTime) / diff * 100}%`);
                    }
                    done();
                });
            });
            cursor += oneHour;
            end += oneHour;
        }

        let ttt = Date.now();
        task.q(jobs, function () {
            w.end();
            errlog.end();
            db.close();
            console.log(`finish`);
            console.log(`the spend time is ${Date.now() - ttt}s`)
        });

    }
});
