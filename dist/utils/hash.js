'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("./bytes");
var utf8_1 = require("./utf8");
var keccak256_1 = require("./keccak256");
var Zeros = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
var Partition = new RegExp("^((.*)\\.)?([^.]+)$");
var UseSTD3ASCIIRules = new RegExp("^[a-z0-9.-]*$");
function namehash(name) {
    name = name.toLowerCase();
    // Supporting the full UTF-8 space requires additional (and large)
    // libraries, so for now we simply do not support them.
    // It should be fairly easy in the future to support systems with
    // String.normalize, but that is future work.
    if (!name.match(UseSTD3ASCIIRules)) {
        throw new Error('contains invalid UseSTD3ASCIIRules characters');
    }
    var result = Zeros;
    while (name.length) {
        var partition = name.match(Partition);
        var label = utf8_1.toUtf8Bytes(partition[3]);
        result = keccak256_1.keccak256(bytes_1.concat([result, keccak256_1.keccak256(label)]));
        name = partition[2] || '';
    }
    return bytes_1.hexlify(result);
}
exports.namehash = namehash;
function id(text) {
    return keccak256_1.keccak256(utf8_1.toUtf8Bytes(text));
}
exports.id = id;
function hashMessage(message) {
    var payload = bytes_1.concat([
        utf8_1.toUtf8Bytes('\x19Ethereum Signed Message:\n'),
        utf8_1.toUtf8Bytes(String(message.length)),
        ((typeof (message) === 'string') ? utf8_1.toUtf8Bytes(message) : message)
    ]);
    return keccak256_1.keccak256(payload);
}
exports.hashMessage = hashMessage;
