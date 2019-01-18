"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("./bytes");
var libraries_1 = __importDefault(require("../libraries"));
function bufferify(value) {
    return Buffer.from(bytes_1.arrayify(value));
}
function pbkdf2(password, salt, iterations, keylen, hashAlgorithm) {
    return new Promise(function (resolve, reject) {
        libraries_1.default.pbkdf2(bufferify(password), bufferify(salt), iterations, keylen, hashAlgorithm, function (err, derivedKey) {
            if (err) {
                reject(err);
                return;
            }
            resolve(bytes_1.arrayify(derivedKey));
        });
    });
}
exports.pbkdf2 = pbkdf2;
