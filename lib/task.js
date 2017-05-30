/**
 * Created by wangqun6 on 2017/5/30.
 */
let q = function (task, callback) {
    let index = 0;
    task[index] && task[index](function () {
        task[++index] ? task[index](arguments.callee, err) : callback();
    }, err);
    function err() {
        callback(`第${index}个任务执行失败`);
    }
};

exports.q = q;