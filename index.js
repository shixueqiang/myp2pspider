'use strict';

// This is an example of using p2pspider, you can change the code to make it do something else.
var fs = require('fs');
var path = require('path');

var bencode = require('bencode');
var P2PSpider = require('./lib');
var db = require('./db/mysql');
var torrent = require('./db/torrent');
var moment = require('moment');
var Segment = require('segment');

var p2p = P2PSpider({
    nodesMaxSize: 400,
    maxConnections: 800,
    timeout: 10000
});

// 创建实例
var segment = new Segment();
// 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
segment.useDefault();

p2p.ignore(function (infohash, rinfo, callback) {
    var torrentFilePathSaveTo = path.join(__dirname, "torrents", infohash + ".torrent");
    fs.exists(torrentFilePathSaveTo, function (exists) {
        callback(exists); //if is not exists, download the metadata.
    });
});

p2p.on('metadata', function (metadata) {
    var time = moment().format('YYYY-MM-DD');
    var torrentDir = path.join(__dirname, "torrents/" + time);
    var torrentFilePathSaveTo = path.join(torrentDir, metadata.infohash + ".torrent");
    var sql = "insert into t_torrent(id,name,name_separate,type,size,files,create_date,enable,magnet,torrent_path) values (?,?,?,?,?,?,?,?,?,?)";
    var data = torrent(metadata.info);
    var now = moment().format('YYYY-MM-DD HH:mm:ss');
    var magnet = 'magnet:?xt=urn:btih:' + metadata.infohash;
    var files = JSON.stringify(data.files);
    files = files.replace(/,/g, "\,");
    var torrentPath = "/torrents/" + time + "/" + metadata.infohash + ".torrent";

    var _fenci = segment.doSegment(data.name, {
        simple: true,
        stripPunctuation: true
    });
    
    var sqlParam = [metadata.infohash, data.name, _fenci.join(' '), data.type, data.size, files, now, 1, magnet, torrentPath];
    db.insert(sql, sqlParam, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            console.log("insert torrent result:" + result);

            // var sqlInsert = "insert into t_bt(torrent_id,content,create_date) values (?,?,?)";
            // db.insert(sqlInsert, [metadata.infohash, bencode.encode({ 'info': metadata.info }), time], function (err, result) {
            //     if (err) {
            //         console.error(err);
            //     }
            // });

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
