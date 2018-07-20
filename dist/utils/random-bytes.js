'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("./bytes");
var crypto_1 = require("crypto");
function randomBytes(length) {
    return bytes_1.arrayify(crypto_1.randomBytes(length));
}
exports.randomBytes = randomBytes;
