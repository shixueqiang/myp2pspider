var db = require('./db/mysql');
var Segment = require('segment');

db.query("select id,name from t_torrent", function (qerr, vals, fields) {
    if (qerr) {
        return console.error(qerr);
    }
    // 创建实例
    var segment = new Segment();
    // 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
    segment.useDefault();
    var length = vals.length;
    console.log("length:" + length);
    for (var i = 0; i < length; i++) {
        var _fenci = segment.doSegment(vals[i].name, {
            simple: true,
            stripPunctuation: true
        });
        // console.log(vals[i].name);
        // console.log(_fenci.join(' '));
        var sql = "update t_torrent set name_separate = ? where id = ?";
        db.update(sql, [_fenci.join(' '), vals[i].id], function (err, result) {
            if (err) {
                return console.error(err);
            }
            console.log("update " + i + " success");
        });
    }

});