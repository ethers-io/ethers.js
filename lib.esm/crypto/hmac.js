import { createHmac } from "./crypto.js";
import { getBytes, hexlify } from "../utils/index.js";
let locked = false;
const _computeHmac = function (algorithm, key, data) {
    return "0x" + createHmac(algorithm, key).update(data).digest("hex");
};
let __computeHmac = _computeHmac;
export function computeHmac(algorithm, _key, _data) {
    const key = getBytes(_key, "key");
    const data = getBytes(_data, "data");
    return hexlify(__computeHmac(algorithm, key, data));
}
computeHmac._ = _computeHmac;
computeHmac.lock = function () { locked = true; };
computeHmac.register = function (func) {
    if (locked) {
        throw new Error("computeHmac is locked");
    }
    __computeHmac = func;
};
Object.freeze(computeHmac);
//# sourceMappingURL=hmac.js.map