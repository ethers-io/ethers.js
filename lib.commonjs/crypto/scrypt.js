"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scryptSync = exports.scrypt = void 0;
const scrypt_1 = require("@noble/hashes/scrypt");
const index_js_1 = require("../utils/index.js");
let lockedSync = false, lockedAsync = false;
const _scryptAsync = async function (passwd, salt, N, r, p, dkLen, onProgress) {
    return await (0, scrypt_1.scryptAsync)(passwd, salt, { N, r, p, dkLen, onProgress });
};
const _scryptSync = function (passwd, salt, N, r, p, dkLen) {
    return (0, scrypt_1.scrypt)(passwd, salt, { N, r, p, dkLen });
};
let __scryptAsync = _scryptAsync;
let __scryptSync = _scryptSync;
async function scrypt(_passwd, _salt, N, r, p, dkLen, progress) {
    const passwd = index_js_1.logger.getBytes(_passwd, "passwd");
    const salt = index_js_1.logger.getBytes(_salt, "salt");
    return (0, index_js_1.hexlify)(await __scryptAsync(passwd, salt, N, r, p, dkLen, progress));
}
exports.scrypt = scrypt;
scrypt._ = _scryptAsync;
scrypt.lock = function () { lockedAsync = true; };
scrypt.register = function (func) {
    if (lockedAsync) {
        throw new Error("scrypt is locked");
    }
    __scryptAsync = func;
};
Object.freeze(scrypt);
function scryptSync(_passwd, _salt, N, r, p, dkLen) {
    const passwd = index_js_1.logger.getBytes(_passwd, "passwd");
    const salt = index_js_1.logger.getBytes(_salt, "salt");
    return (0, index_js_1.hexlify)(__scryptSync(passwd, salt, N, r, p, dkLen));
}
exports.scryptSync = scryptSync;
scryptSync._ = _scryptSync;
scryptSync.lock = function () { lockedSync = true; };
scryptSync.register = function (func) {
    if (lockedSync) {
        throw new Error("scryptSync is locked");
    }
    __scryptSync = func;
};
Object.freeze(scryptSync);
//# sourceMappingURL=scrypt.js.map