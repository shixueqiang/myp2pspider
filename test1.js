var db = require('./db/mysql');
var moment = require('moment');

db.query("select id,files from t_torrent",function(qerr,vals,fields) {
    if(qerr) {
        return console.error(qerr);
    }
    var i;
    var length = vals.length;
    console.log("length:" + length);
    for(i = 0;i<length;i++) {
        console.log("update:" + i);
        var sql = "insert into t_files(name,size,torrent_id) values (?,?,?)";
        var files = JSON.parse(vals[i].files);
        var j;
        var id = vals[i].id;
        if(files) {
            for(j = 0;j<files.length;j++) {
                // console.log(files[j].name);
                var name = files[j].name;
                var size = files[j].size;
                db.insert(sql,[name,size,id],function(err,result) {
                    if(err) {
                        console.error(err);
                    }
                });
            }
        }
    }
    
});