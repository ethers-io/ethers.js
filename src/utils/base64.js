'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var convert_1 = require("./convert");
function decode(textData) {
    return convert_1.arrayify(new Uint8Array(new Buffer(textData, 'base64')));
}
exports.decode = decode;
;
function encode(data) {
    return new Buffer(convert_1.arrayify(data)).toString('base64');
}
exports.encode = encode;
