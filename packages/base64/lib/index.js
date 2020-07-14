"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("@ethersproject/bytes");
function decode(textData) {
    return bytes_1.arrayify(new Uint8Array(Buffer.from(textData, "base64")));
}
exports.decode = decode;
;
function encode(data) {
    return Buffer.from(bytes_1.arrayify(data)).toString("base64");
}
exports.encode = encode;
//# sourceMappingURL=index.js.map