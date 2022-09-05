"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomBytes = void 0;
const crypto_js_1 = require("./crypto.js");
let locked = false;
const _randomBytes = function (length) {
    return new Uint8Array((0, crypto_js_1.randomBytes)(length));
};
let __randomBytes = _randomBytes;
function randomBytes(length) {
    return __randomBytes(length);
}
exports.randomBytes = randomBytes;
randomBytes._ = _randomBytes;
randomBytes.lock = function () { locked = true; };
randomBytes.register = function (func) {
    if (locked) {
        throw new Error("random is locked");
    }
    __randomBytes = func;
};
Object.freeze(randomBytes);
//# sourceMappingURL=random.js.map