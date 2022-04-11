import { createHash } from "crypto"; /*-browser*/
import { hexlify } from "@ethersproject/bytes";
import { logger } from "./logger.js";
const _sha256 = function (data) {
    return createHash("sha256").update(data).digest();
};
const _sha512 = function (data) {
    return createHash("sha512").update(data).digest();
};
let __sha256 = _sha256;
let __sha512 = _sha512;
let locked256 = false, locked512 = false;
export function sha256(_data) {
    const data = logger.getBytes(_data, "data");
    return hexlify(__sha256(data));
}
sha256._ = _sha256;
sha256.lock = function () { locked256 = true; };
sha256.register = function (func) {
    if (locked256) {
        throw new Error("sha256 is locked");
    }
    __sha256 = func;
};
Object.freeze(sha256);
export function sha512(_data) {
    const data = logger.getBytes(_data, "data");
    return hexlify(__sha512(data));
}
sha512._ = _sha512;
sha512.lock = function () { locked512 = true; };
sha512.register = function (func) {
    if (locked512) {
        throw new Error("sha512 is locked");
    }
    __sha512 = func;
};
Object.freeze(sha256);
//# sourceMappingURL=sha2.js.map