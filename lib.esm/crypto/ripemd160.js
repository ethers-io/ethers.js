import { ripemd160 as noble_ripemd160 } from "@noble/hashes/ripemd160";
import { hexlify, logger } from "../utils/index.js";
let locked = false;
const _ripemd160 = function (data) {
    return noble_ripemd160(data);
};
let __ripemd160 = _ripemd160;
export function ripemd160(_data) {
    const data = logger.getBytes(_data, "data");
    return hexlify(__ripemd160(data));
}
ripemd160._ = _ripemd160;
ripemd160.lock = function () { locked = true; };
ripemd160.register = function (func) {
    if (locked) {
        throw new TypeError("ripemd160 is locked");
    }
    __ripemd160 = func;
};
Object.freeze(ripemd160);
//# sourceMappingURL=ripemd160.js.map