/**
 * Created by wangqun6 on 2017/5/29.
 */

let ip = require('../lib/ip');
ip.load("../data/ip.dat");

console.log(ip.findSync("111.204.243.4"));