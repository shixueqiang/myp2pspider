var query = require('mysql');
var path = require('path');
var _ = require('lodash');

var getFileListAndSize, getFileType;
module.exports = function Torrent(metainfo) {
    if (metainfo.files) {
        var fileListAndSize = getFileListAndSize(metainfo.files);
        return {
            // 种子文件名
            name: (metainfo['name.utf-8'] || metainfo['name']).toString(),
            // 主文件类型
            type: getFileType(metainfo.files),
            // 包含的文件列表
            files: fileListAndSize.list,
            // 总大小
            size: fileListAndSize.size
        };
    } else {
        var name = (metainfo['name.utf-8'] || metainfo['name']).toString(),
            _split = name.split('.'),
            type = _split.length <= 0 ? '' : _split[_split.length - 1];

        return {
            name: name,
            type: type,
            files: {
                name: name,
                size: metainfo.length
            },
            size: metainfo.length
        };
    }
};

// 格式化文件列表
getFileListAndSize = function (list) {
    var result = [],
        size = 0;

    list.map(function (currentValue) {
        var names = currentValue['path.utf-8'] || currentValue['path'],
            item = {
                size: currentValue.length, // 文件大小
                name: names[names.length - 1].toString() // 文件名
            };

        result.unshift(item);
        size += currentValue.length;
    });

    return {
        list: result,
        size: size
    };
};

// 获取主文件类型
getFileType = function (list) {
    if (!list || list.length <= 0) {
        return '';
    }

    var mainFile = _.max(list, 'length'),
        mainFileName = mainFile['path.utf-8'] || mainFile['path'],
        _split = mainFileName[mainFileName.length - 1].toString().split('.');

    return _split.length <= 0 ? '' : _split[_split.length - 1];
};