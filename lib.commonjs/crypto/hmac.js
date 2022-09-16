"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHmac = void 0;
const crypto_js_1 = require("./crypto.js");
const index_js_1 = require("../utils/index.js");
let locked = false;
const _computeHmac = function (algorithm, key, data) {
    return "0x" + (0, crypto_js_1.createHmac)(algorithm, key).update(data).digest("hex");
};
let __computeHmac = _computeHmac;
function computeHmac(algorithm, _key, _data) {
    const key = (0, index_js_1.getBytes)(_key, "key");
    const data = (0, index_js_1.getBytes)(_data, "data");
    return (0, index_js_1.hexlify)(__computeHmac(algorithm, key, data));
}
exports.computeHmac = computeHmac;
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