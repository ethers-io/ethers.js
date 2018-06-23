'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_1 = require("./bignumber");
var bytes_1 = require("./bytes");
var utf8_1 = require("./utf8");
var keccak256_1 = require("./keccak256");
var sha2_1 = require("./sha2");
var regexBytes = new RegExp("^bytes([0-9]+)$");
var regexNumber = new RegExp("^(u?int)([0-9]*)$");
var regexArray = new RegExp("^(.*)\\[([0-9]*)\\]$");
var Zeros = '0000000000000000000000000000000000000000000000000000000000000000';
function _pack(type, value, isArray) {
    switch (type) {
        case 'address':
            if (isArray) {
                return bytes_1.padZeros(value, 32);
            }
            return bytes_1.arrayify(value);
        case 'string':
            return utf8_1.toUtf8Bytes(value);
        case 'bytes':
            return bytes_1.arrayify(value);
        case 'bool':
            value = (value ? '0x01' : '0x00');
            if (isArray) {
                return bytes_1.padZeros(value, 32);
            }
            return bytes_1.arrayify(value);
    }
    var match = type.match(regexNumber);
    if (match) {
        //var signed = (match[1] === 'int')
        var size = parseInt(match[2] || "256");
        if ((size % 8 != 0) || size === 0 || size > 256) {
            throw new Error('invalid number type - ' + type);
        }
        if (isArray) {
            size = 256;
        }
        value = bignumber_1.bigNumberify(value).toTwos(size);
        return bytes_1.padZeros(value, size / 8);
    }
    match = type.match(regexBytes);
    if (match) {
        var size = parseInt(match[1]);
        if (String(size) != match[1] || size === 0 || size > 32) {
            throw new Error('invalid number type - ' + type);
        }
        if (bytes_1.arrayify(value).byteLength !== size) {
            throw new Error('invalid value for ' + type);
        }
        if (isArray) {
            return bytes_1.arrayify((value + Zeros).substring(0, 66));
        }
        return value;
    }
    match = type.match(regexArray);
    if (match && Array.isArray(value)) {
        var baseType = match[1];
        var count = parseInt(match[2] || String(value.length));
        if (count != value.length) {
            throw new Error('invalid value for ' + type);
        }
        var result = [];
        value.forEach(function (value) {
            result.push(_pack(baseType, value, true));
        });
        return bytes_1.concat(result);
    }
    throw new Error('unknown type - ' + type);
}
// @TODO: Array Enum
function pack(types, values) {
    if (types.length != values.length) {
        throw new Error('type/value count mismatch');
    }
    var tight = [];
    types.forEach(function (type, index) {
        tight.push(_pack(type, values[index]));
    });
    return bytes_1.hexlify(bytes_1.concat(tight));
}
exports.pack = pack;
function keccak256(types, values) {
    return keccak256_1.keccak256(pack(types, values));
}
exports.keccak256 = keccak256;
function sha256(types, values) {
    return sha2_1.sha256(pack(types, values));
}
exports.sha256 = sha256;
