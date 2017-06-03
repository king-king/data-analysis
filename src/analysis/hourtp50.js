/**
 * Created by wangqun6 on 2017/6/3.
 */

// 得到每个页面每小时的tp50

/**
 * Created by wangqun6 on 2017/6/1.
 */
// 得到每小时的数据，每个页面的数据

let fs = require('fs');
let task = require('../../lib/task');
let url = require('url');

let result = fs.createWriteStream('../../important/tp50-tp90.js', {flags: 'w'});

function sort(arr) {
    return arr.sort((a, b) => {
        return a - b;
    });
}

let out = [];
let t0 = Date.now();
fs.readFile('../../important/pageTime.js', 'utf-8', function (err, content) {
    let lines = content.split('\n');
    lines.forEach(function (line) {
        if (line) {
            let obj = JSON.parse(line);
            let re = {};
            for (let key in obj.result) {
                let st = sort(obj.result[key].st);
                let bt = sort(obj.result[key].bt);
                let wt = sort(obj.result[key].wt);
                let jt = sort(obj.result[key].jt);
                let skey = key.replace('sz.jd.com', '');
                re[skey] = {
                    count: obj.result[key].count,
                    st: {tp50: st[st.length / 2 << 0], tp90: st[st.length * 0.9 << 0]},
                    bt: {tp50: bt[bt.length / 2 << 0], tp90: bt[bt.length * 0.9 << 0]},
                    wt: {tp50: wt[wt.length / 2 << 0], tp90: wt[wt.length * 0.9 << 0]},
                    jt: {tp50: jt[st.length / 2 << 0], tp90: jt[st.length * 0.9 << 0]}
                }
            }
            obj.result = re;
            out.push(obj);
        }
    });
    result.write(JSON.stringify(out));
    result.end();
    console.log(`结束，共花费${(Date.now() - t0) / 1000}s`)
});