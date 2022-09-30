import { randomBytes as crypto_random } from "./crypto.js";

let locked = false;

const _randomBytes = function(length: number): Uint8Array {
    return new Uint8Array(crypto_random(length));
}

let __randomBytes = _randomBytes;

export function randomBytes(length: number): Uint8Array {
    return __randomBytes(length);
}

randomBytes._ = _randomBytes;
randomBytes.lock = function(): void { locked = true; }
randomBytes.register = function(func: (length: number) => Uint8Array) {
    if (locked) { throw new Error("randomBytes is locked"); }
    __randomBytes = func;
}
Object.freeze(randomBytes);
