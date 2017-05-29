/**
 * Created by wangqun6 on 2017/5/29.
 */
let fs = require('fs');
let dns = require('dns');
let dataBuffer = null;

function loadBinaryData(filepath) {
    let fd = fs.openSync(filepath, 'r');
    let indexLengthBuffer = new Buffer(4);
    let chunkSize = 102400,
        chunkBuffer,
        chunks = [];

    let readLength = 0,
        bufferLength = 0;

    while (true) {
        chunkBuffer = new Buffer(chunkSize);
        readLength = fs.readSync(fd, chunkBuffer, 0, chunkSize, bufferLength);
        bufferLength += readLength;
        chunks.push(chunkBuffer);
        if (readLength < chunkSize) break;
    }
    fs.closeSync(fd);

    return Buffer.concat(chunks);
}

function IpFind(ip) {
    if (dataBuffer === null) {
        return [];
    }
    let ipArray = ip.trim().split('.'),
        ip2long = function (ip) {
            return new Buffer(ip.trim().split('.')).readInt32BE(0)
        },
        ipInt = ip2long(ip);

    let offset = dataBuffer.readInt32BE(0);
    let indexBuffer = dataBuffer.slice(4, offset - 4 + 4);
    let tmp_offset = ipArray[0] * 4, max_comp_len = offset - 1028, index_offset = -1, index_length = -1,
        start = indexBuffer.slice(tmp_offset, tmp_offset + 4).readInt32LE(0);
    for (start = start * 8 + 1024; start < max_comp_len; start += 8) {
        if (indexBuffer.slice(start, start + 4).readInt32BE(0) >= ipInt) {
            index_offset = ((indexBuffer[start + 6] << 16) + (indexBuffer[start + 5] << 8) + indexBuffer[start + 4]);
            index_length = indexBuffer[start + 7];
            break;
        }
    }
    if (index_offset === -1 || index_length === -1) {
        return [];
    } else {
        return dataBuffer.slice(offset + index_offset - 1024, offset + index_offset - 1024 + index_length).toString('utf-8').split("\t");
    }
}


exports.load = function (file) {
    if (dataBuffer === null) {
        dataBuffer = loadBinaryData(file);
    }
};

exports.find = function (name, callback) {
    dns.resolve4(name, function (err, addresses) {
        if (err) {
            callback(IpFind(name));
        } else {
            callback(IpFind(addresses.shift()));
        }
    });
};
exports.findSync = IpFind;