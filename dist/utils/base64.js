'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("./bytes");
function decode(textData) {
    return bytes_1.arrayify(new Uint8Array(new Buffer(textData, 'base64')));
}
exports.decode = decode;
;
function encode(data) {
    return new Buffer(bytes_1.arrayify(data)).toString('base64');
}
exports.encode = encode;
