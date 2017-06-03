/**
 * Created by wangqun6 on 2017/6/3.
 */

// 该文件用于检验hourData生成的数据在数量上是否有误，会对聚合次数求和，看是否与PC为true的数量相等

let fs = require('fs');
let url = require('url');

let t0 = Date.now();
let sum = 0;
let count = 0;
fs.readFile('../../important/pageTime.js', 'utf-8', function (err, content) {
    if (err) {
        console.log(err);
    } else {
        console.log(`文件内容读取成功，耗时${Date.now() - t0}ms`);
        let arr = content.split('\n');
        arr.forEach(function (item, i) {
            if (item) {
                let obj = JSON.parse(item);
                count += obj.sum;
                // obj.result.forEach(function (d) {
                //     sum += d.count;
                // });
                for (let key in obj.result) {
                    sum += obj.result[key].count;
                }
            }
        });
        console.log(count, sum);
        console.log(`执行完毕，共花费${(Date.now() - t0) / 1000}s`)
    }
});
