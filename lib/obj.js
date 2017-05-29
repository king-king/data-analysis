/**
 * Created by wangqun6 on 2017/5/29.
 */

function loopObj(obj, func) {
    for (let key in obj) {
        func(key, obj[key]);
    }
}

// 把src中的key-value复制到tar中，覆盖
function extend(tarObj, srcObj) {
    loopObj(srcObj, function (key, value) {
        tarObj[key] = value;
    });
}

exports.loopObj = loopObj;
exports.extend = extend;