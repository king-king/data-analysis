/**
 * Created by wangqun6 on 2017/5/29.
 */
let MongoClient = require('mongodb').MongoClient;

let fs = require('fs');
let url = require('url');
let ip = require('../lib/ip');
ip.load("../data/ip.dat");
let Obj = require('../lib/obj');


let sumLines = 0;
let szLines = 0;

MongoClient.connect('mongodb://localhost:27017/analysis', function (err, db) {
    if (err) {
        console.log(err);
    } else {
        let col = db.collection('visit');
        fs.readdir('e:/LOGS/', function (err, files) {
            // console.log( data );
            files.forEach(function (filename, i) {
                // console.log( filename );
                fs.readFile(`e:/LOGS/${filename}`, 'utf8', (err, content) => {
                    if (err) {
                        console.log(`在读取${filename}的出错`, err);
                    } else {
                        let lines = content.split('\n');
                        sumLines += (lines.length - 1);
                        let insertData = [];
                        lines.forEach(function (line, i) {
                            if (line) {
                                let obj = JSON.parse(line[0]);
                                // 把符合要求的每行数据插入
                                if (url.parse(obj.page).hostname === 'sz.jd.com') {
                                    szLines++;
                                    Obj.extend(obj, url.parse(obj.requestUrl, true).query);
                                    obj.wt = Number(obj.wt);
                                    obj.jt = Number(obj.jt);
                                    obj.st = Number(obj.st);
                                    obj.bt = Number(obj.bt);
                                    obj.time = Number(obj.time);
                                    delete obj.header;
                                    let area = ip.findSync(obj.ip);
                                    obj.country = area[0];
                                    obj.province = area[1];
                                    insertData.push(obj)
                                }
                            }
                        });
                        col.insertMany(insertData, function (err, r) {
                            if (err) {
                                console.log(`${filename}文件数据在插入过程中出错`);
                            } else {
                                if (r.insertedCount !== insertData.length) {
                                    console.log(`err：文件${filename}应该插入${insertData.length},实际插入${r.insertedCount}`);
                                } else {
                                    console.log(`文件${filename}中的数据全部插入完毕`)
                                }
                            }

                        });
                    }
                });
            });
        });
    }

});