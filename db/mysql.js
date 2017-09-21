var mysql = require('mysql'),
    config = require('../config');

var pool = mysql.createPool({  
    host: config.mysqlHost,  
    user: config.mysqlUser,  
    password: config.mysqlPassword,  
    database: config.mysqlDatabase,  
    port: config.mysqlPort  
});  

exports.query=function(sql,callback){
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql,function(qerr,vals,fields){
                //释放连接
                conn.release();
                //事件驱动回调
                callback(qerr,vals,fields);
            });
        }
    });
};

exports.insert=function(sql,sqlParam,callback) {
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,0);
        }else{
            conn.query(sql,sqlParam,function(err,result){
                //释放连接
                conn.release();
                //事件驱动回调
                callback(err,result);
            });
        }
    });
};

exports.update=function(sql,sqlParam,callback) {
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,0);
        }else{
            conn.query(sql,sqlParam,function(err,result){
                //释放连接
                conn.release();
                //事件驱动回调
                callback(err,result);
            });
        }
    });
}