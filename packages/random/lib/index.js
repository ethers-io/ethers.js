"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var bytes_1 = require("@ethersproject/bytes");
var shuffle_1 = require("./shuffle");
exports.shuffled = shuffle_1.shuffled;
function randomBytes(length) {
    return bytes_1.arrayify(crypto_1.randomBytes(length));
}
exports.randomBytes = randomBytes;
//# sourceMappingURL=index.js.map