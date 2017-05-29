/**
 * Created by acer on 2017/5/28.
 */

// {
//     "time": true,
//     "requestUrl": true,
//     "userAgent": true,
//     "ip": true
// }


let fs = require('fs');
let url = require('url');

let Obj = require('../lib/obj');

fs.readdir('e:/LOGS/', function (err, data) {
    // console.log( data );
    data.forEach(function (filename, i) {
        // console.log( filename );
        !i && fs.readFile(`e:/LOGS/${filename}`, 'utf8', (err, content) => {
            if (err) {
                console.log(err);
            } else {
                let lines = content.split('\n');
                let obj = JSON.parse(lines[0]);
                Obj.extend(obj, url.parse(obj.requestUrl, true).query);
                obj.wt = Number(obj.wt);
                obj.jt = Number(obj.jt);
                obj.st = Number(obj.st);
                obj.bt = Number(obj.bt);
                obj.time = Number(obj.time);
                console.log(obj);
            }
        });
    });
});
