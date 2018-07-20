'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var bytes_1 = require("./bytes");
function bufferify(value) {
    return new Buffer(bytes_1.arrayify(value));
}
function pbkdf2(password, salt, iterations, keylen, hashAlgorithm) {
    return bytes_1.arrayify(crypto_1.pbkdf2Sync(bufferify(password), bufferify(salt), iterations, keylen, hashAlgorithm));
}
exports.pbkdf2 = pbkdf2;
