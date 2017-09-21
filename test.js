var db = require('./db/mysql');
var moment = require('moment');

db.query("select id from t_torrent",function(qerr,vals,fields) {
    if(qerr) {
        return console.error(qerr);
    }
    var len = vals.length;
    var i;
    for(i=0;i<len;i++) {
        var time = moment().format('YYYY-MM-DD');
        var param = "/torrents/"+time+"/"+vals[i].id+".torrent";
        console.log(param);
        db.update("update t_torrent set torrent_path = ? where id = ?",[param,vals[i].id],function(err,result) {
            if(err) {
                return console.error(err);
            }
            console.log("update rows result:" + result.affectedRows);
        });
    }
});