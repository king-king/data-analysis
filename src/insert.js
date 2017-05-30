/**
 * Created by wangqun6 on 2017/5/29.
 */
let MongoClient = require('mongodb').MongoClient;

let fs = require('fs');
let url = require('url');
let ip = require('../lib/ip');
ip.load("../data/ip.dat");
let Obj = require('../lib/obj');
let task = require('../lib/task');


let sumLines = 0;
let szTimeLines = 0;
let shouldInsertLines = 0;
let pcLines = 0;

let writer = fs.createWriteStream('../log/task.log', {flags: 'a'});
let jobs = [];

MongoClient.connect('mongodb://localhost:27017/analysis', function (err, db) {
    if (err) {
        console.log('数据库连接失败');
        writer.write(err.toString());
    }
    else {
        console.log('数据库连接成功');
        let col = db.collection('visit');
        fs.readdir('e:/LOGS/', function (err, files) {
            if (err) {
                console.log(err);
                writer.write(err.toString());
            } else {
                files.forEach(function (filename, i) {
                    jobs.push(function (done) {
                        console.log('开始读取文件');
                        fs.readFile(`e:/LOGS/${filename}`, 'utf8', (err, content) => {
                            if (err) {
                                console.log(`在读取${filename}的出错`, err);
                                writer.write(err.toString());
                            } else {
                                console.log(`读取${filename}成功`);
                                let lines = content.split('\n');
                                sumLines += (lines.length - 1);
                                let insertData = [];
                                lines.forEach(function (line, i) {
                                    if (line) {
                                        let str = line.slice(line.indexOf('"requestUrl":"') + 14, line.indexOf('","userAgent"'));
                                        let re = str.replace(/"/g, '\\"').replace(/\s/g, "");
                                        line = line.replace(str, re);

                                        // 把符合要求的每行数据插入
                                        if (line.indexOf('/baseTime.jpg') !== -1) {
                                            let obj = JSON.parse(line);
                                            let urlObj = url.parse(obj.requestUrl, true).query;
                                            if (urlObj.page.indexOf('sz.jd.com') !== -1) {
                                                shouldInsertLines++;
                                                obj.wtime = obj.time;
                                                Obj.extend(obj, urlObj);
                                                obj.wt = Number(obj.wt);
                                                obj.jt = Number(obj.jt);
                                                obj.st = Number(obj.st);
                                                obj.bt = Number(obj.bt);
                                                obj.time = Number(obj.time);
                                                delete obj.headers;
                                                let area = ip.findSync(obj.ip);
                                                obj.country = area[0];
                                                obj.province = area[1];
                                                if (-1 !== obj.userAgent.indexOf('iPhone')) {
                                                    obj.iPhone = true;
                                                    obj.mobile = true;
                                                }
                                                else if (obj.userAgent.indexOf('Android') !== -1) {
                                                    obj.mobile = true;
                                                    obj.Android = true;
                                                }
                                                else {
                                                    obj.mobile = false;
                                                    obj.PC = true;
                                                    pcLines++;
                                                }
                                                for (let key in obj) {
                                                    if (key.indexOf('.') !== -1) {
                                                        delete obj[key];
                                                    }
                                                }
                                                insertData.push(obj)
                                            }
                                        }
                                    }
                                });
                                console.log(`文件${filename}插入数据库`);
                                col.insertMany(insertData, function (err, r) {
                                    if (err) {
                                        console.log(`${filename}文件数据在插入数据库过程中出错`, err);
                                        writer.write(err.toString());
                                        done();
                                    }
                                    else {
                                        szTimeLines += r.insertedCount;
                                        if (r.insertedCount !== insertData.length) {
                                            console.log(`err：文件${filename}应该插入${insertData.length},实际插入${r.insertedCount}`);
                                            writer.write(`err：文件${filename}应该插入${insertData.length},实际插入${r.insertedCount}`);
                                        } else {
                                            console.log(`文件${filename}中的数据全部插入完毕`);
                                            writer.write(`文件${filename}中的数据全部插入完毕`);
                                        }
                                        done();
                                    }
                                });
                            }
                        });
                    });
                });

                console.log('开始执行任务');
                task.q(jobs, function () {
                    console.log('数据插入工作进行完毕');
                    console.log(`一共有${sumLines}条数据，其中应插入${shouldInsertLines}条，实际插入${szTimeLines}条，pc端占比${pcLines / shouldInsertLines}`);
                    db.close();
                    writer.end();
                });
            }
        });
    }

});