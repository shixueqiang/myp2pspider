'use strict';

// This is an example of using p2pspider, you can change the code to make it do something else.
var fs = require('fs');
var path = require('path');

var bencode = require('bencode');
var P2PSpider = require('./lib');
var db = require('./db/mysql');
var torrent = require('./db/torrent');
var moment = require('moment');

var p2p = P2PSpider({
    nodesMaxSize: 400,
    maxConnections: 800,
    timeout: 10000
});

p2p.ignore(function (infohash, rinfo, callback) {
    var torrentFilePathSaveTo = path.join(__dirname, "torrents", infohash + ".torrent");
    fs.exists(torrentFilePathSaveTo, function(exists) {
        callback(exists); //if is not exists, download the metadata.
    });
});

p2p.on('metadata', function (metadata) {
    var time = moment().format('YYYY-MM-DD');
    var torrentDir = path.join(__dirname, "torrents/" + time);
    var torrentFilePathSaveTo = path.join(torrentDir, metadata.infohash + ".torrent");
    var sql = "insert into t_torrent(id,name,type,size,files,create_date,enable,magnet,torrent_path) values (?,?,?,?,?,?,?,?,?)";
    var data = torrent(metadata.info);
    var now = moment().format('YYYY-MM-DD HH:mm:ss');
    var magnet = 'magnet:?xt=urn:btih:' + metadata.infohash;
    var files = JSON.stringify(data.files);
    files = files.replace(/,/g,"\,");
    var torrentPath = "/torrents/" + time + "/" + metadata.infohash + ".torrent";
    var sqlParam = [metadata.infohash,data.name,data.type,data.size,files,now,1,magnet,torrentPath];
    db.insert(sql,sqlParam,function(err,result) {
        if(err) {
            console.error(err);
        } else {
            console.log("insert torrent result:" + result);

            // var i;
            // for(i = 0; i < data.files.length; i++) {
            //     var item = data.files[i];
            //     var sql = "insert into t_files(name,size,torrent_id) values (?,?,?)";
            //     db.insert(sql,[item.name,item.size,metadata.infohashclear],function(err,result) {
            //         if(err) {
            //             console.error(err);
            //         }
            //     });
            // }

            // fs.exists(torrentDir,function(exist) {
            //     if(!exist) {
            //         fs.mkdir(torrentDir,function(err) {
            //             if(err) {
            //                 console.error(err);
            //             } else {
            //                 fs.writeFile(torrentFilePathSaveTo, bencode.encode({'info': metadata.info}), function(err) {
            //                     if (err) {
            //                         return console.error(err);
            //                     }
            //                     console.log(metadata.infohash + ".torrent has saved.");
            //                 });
            //             }
            //         });
            //     } else {
            //         fs.writeFile(torrentFilePathSaveTo, bencode.encode({'info': metadata.info}), function(err) {
            //             if (err) {
            //                 return console.error(err);
            //             }
            //             console.log(metadata.infohash + ".torrent has saved.");
            //         });
            //     }
            // });
        }
        
    });
    
});

p2p.listen(6881, '0.0.0.0');
