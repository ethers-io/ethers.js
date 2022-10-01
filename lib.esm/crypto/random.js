import { randomBytes as crypto_random } from "./crypto.js";
let locked = false;
const _randomBytes = function (length) {
    return new Uint8Array(crypto_random(length));
};
let __randomBytes = _randomBytes;
export function randomBytes(length) {
    return __randomBytes(length);
}
randomBytes._ = _randomBytes;
randomBytes.lock = function () { locked = true; };
randomBytes.register = function (func) {
    if (locked) {
        throw new Error("randomBytes is locked");
    }
    __randomBytes = func;
};
Object.freeze(randomBytes);
//# sourceMappingURL=random.js.map