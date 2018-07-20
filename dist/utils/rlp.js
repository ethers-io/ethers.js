"use strict";
//See: https://github.com/ethereum/wiki/wiki/RLP
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("./bytes");
function arrayifyInteger(value) {
    var result = [];
    while (value) {
        result.unshift(value & 0xff);
        value >>= 8;
    }
    return result;
}
function unarrayifyInteger(data, offset, length) {
    var result = 0;
    for (var i = 0; i < length; i++) {
        result = (result * 256) + data[offset + i];
    }
    return result;
}
function _encode(object) {
    if (Array.isArray(object)) {
        var payload = [];
        object.forEach(function (child) {
            payload = payload.concat(_encode(child));
        });
        if (payload.length <= 55) {
            payload.unshift(0xc0 + payload.length);
            return payload;
        }
        var length = arrayifyInteger(payload.length);
        length.unshift(0xf7 + length.length);
        return length.concat(payload);
    }
    var data = Array.prototype.slice.call(bytes_1.arrayify(object));
    if (data.length === 1 && data[0] <= 0x7f) {
        return data;
    }
    else if (data.length <= 55) {
        data.unshift(0x80 + data.length);
        return data;
    }
    var length = arrayifyInteger(data.length);
    length.unshift(0xb7 + length.length);
    return length.concat(data);
}
function encode(object) {
    return bytes_1.hexlify(_encode(object));
}
exports.encode = encode;
function _decodeChildren(data, offset, childOffset, length) {
    var result = [];
    while (childOffset < offset + 1 + length) {
        var decoded = _decode(data, childOffset);
        result.push(decoded.result);
        childOffset += decoded.consumed;
        if (childOffset > offset + 1 + length) {
            throw new Error('invalid rlp');
        }
    }
    return { consumed: (1 + length), result: result };
}
// returns { consumed: number, result: Object }
function _decode(data, offset) {
    if (data.length === 0) {
        throw new Error('invalid rlp data');
    }
    // Array with extra length prefix
    if (data[offset] >= 0xf8) {
        var lengthLength = data[offset] - 0xf7;
        if (offset + 1 + lengthLength > data.length) {
            throw new Error('too short');
        }
        var length = unarrayifyInteger(data, offset + 1, lengthLength);
        if (offset + 1 + lengthLength + length > data.length) {
            throw new Error('to short');
        }
        return _decodeChildren(data, offset, offset + 1 + lengthLength, lengthLength + length);
    }
    else if (data[offset] >= 0xc0) {
        var length = data[offset] - 0xc0;
        if (offset + 1 + length > data.length) {
            throw new Error('invalid rlp data');
        }
        return _decodeChildren(data, offset, offset + 1, length);
    }
    else if (data[offset] >= 0xb8) {
        var lengthLength = data[offset] - 0xb7;
        if (offset + 1 + lengthLength > data.length) {
            throw new Error('invalid rlp data');
        }
        var length = unarrayifyInteger(data, offset + 1, lengthLength);
        if (offset + 1 + lengthLength + length > data.length) {
            throw new Error('invalid rlp data');
        }
        var result = bytes_1.hexlify(data.slice(offset + 1 + lengthLength, offset + 1 + lengthLength + length));
        return { consumed: (1 + lengthLength + length), result: result };
    }
    else if (data[offset] >= 0x80) {
        var length = data[offset] - 0x80;
        if (offset + 1 + length > data.length) {
            throw new Error('invlaid rlp data');
        }
        var result = bytes_1.hexlify(data.slice(offset + 1, offset + 1 + length));
        return { consumed: (1 + length), result: result };
    }
    return { consumed: 1, result: bytes_1.hexlify(data[offset]) };
}
function decode(data) {
    var bytes = bytes_1.arrayify(data);
    var decoded = _decode(bytes, 0);
    if (decoded.consumed !== bytes.length) {
        throw new Error('invalid rlp data');
    }
    return decoded.result;
}
exports.decode = decode;
