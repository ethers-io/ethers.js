import { scrypt as _nobleSync, scryptAsync as _nobleAsync } from "@noble/hashes/scrypt";
import { hexlify as H, logger } from "../utils/index.js";
let lockedSync = false, lockedAsync = false;
const _scryptAsync = async function (passwd, salt, N, r, p, dkLen, onProgress) {
    return await _nobleAsync(passwd, salt, { N, r, p, dkLen, onProgress });
};
const _scryptSync = function (passwd, salt, N, r, p, dkLen) {
    return _nobleSync(passwd, salt, { N, r, p, dkLen });
};
let __scryptAsync = _scryptAsync;
let __scryptSync = _scryptSync;
export async function scrypt(_passwd, _salt, N, r, p, dkLen, progress) {
    const passwd = logger.getBytes(_passwd, "passwd");
    const salt = logger.getBytes(_salt, "salt");
    return H(await __scryptAsync(passwd, salt, N, r, p, dkLen, progress));
}
scrypt._ = _scryptAsync;
scrypt.lock = function () { lockedAsync = true; };
scrypt.register = function (func) {
    if (lockedAsync) {
        throw new Error("scrypt is locked");
    }
    __scryptAsync = func;
};
Object.freeze(scrypt);
export function scryptSync(_passwd, _salt, N, r, p, dkLen) {
    const passwd = logger.getBytes(_passwd, "passwd");
    const salt = logger.getBytes(_salt, "salt");
    return H(__scryptSync(passwd, salt, N, r, p, dkLen));
}
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