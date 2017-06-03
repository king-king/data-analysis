/**
 * Created by wangqun6 on 2017/6/3.
 */

// 得到每个页面的总tp50、tp90


let fs = require('fs');
let task = require('../../lib/task');
let url = require('url');

let pageCount = require('../../important/pageCount');

let result = fs.createWriteStream('../../important/sum-tp50-tp90.js', {flags: 'w'});

function sort(arr) {
    return arr.sort((a, b) => {
        return a - b;
    });
}

let pageSet = {};
pageCount.forEach(function (item) {
    pageSet[item.name] = {
        st: [],
        wt: [],
        jt: [],
        bt: []
    };
});
let t0 = Date.now();
fs.readFile('../../important/pageTime.js', 'utf-8', function (err, content) {
    let lines = content.split('\n');
    lines.forEach(function (line, i) {
        if (line) {
            line = JSON.parse(line);
            for (let pageUrl in line.result) {
                pageSet[pageUrl].wt = pageSet[pageUrl].wt.concat(line.result[pageUrl].wt);
                pageSet[pageUrl].bt = pageSet[pageUrl].bt.concat(line.result[pageUrl].bt);
                pageSet[pageUrl].jt = pageSet[pageUrl].jt.concat(line.result[pageUrl].jt);
                pageSet[pageUrl].st = pageSet[pageUrl].st.concat(line.result[pageUrl].st);
            }
        }
        console.log(`行分析进度${(i + 1) / lines.length * 100}%`)
    });
    console.log(`开始计算tp50,tp90`);
    for (let url in pageSet) {
        let wt = sort(pageSet[url].wt);
        let bt = sort(pageSet[url].bt);
        let jt = sort(pageSet[url].jt);
        let st = sort(pageSet[url].st);
        pageSet[url] = {
            st: {
                tp50: st[st.length * 0.5 << 0],
                tp90: st[st.length * 0.9 << 0]
            },
            wt: {
                tp50: wt[wt.length * 0.5 << 0],
                tp90: wt[wt.length * 0.9 << 0]
            },
            jt: {
                tp50: jt[jt.length * 0.5 << 0],
                tp90: jt[jt.length * 0.9 << 0]
            },
            bt: {
                tp50: bt[bt.length * 0.5 << 0],
                tp90: bt[bt.length * 0.9 << 0]
            }
        }
    }
    result.write(JSON.stringify(pageSet));
    result.end();
    console.log(`结束，共花费${(Date.now() - t0) / 1000}s`)
});