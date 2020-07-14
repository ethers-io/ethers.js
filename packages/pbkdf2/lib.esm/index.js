"use strict";
import { pbkdf2Sync as _pbkdf2 } from "crypto";
import { arrayify, hexlify } from "@ethersproject/bytes";
function bufferify(value) {
    return Buffer.from(arrayify(value));
}
export function pbkdf2(password, salt, iterations, keylen, hashAlgorithm) {
    return hexlify(_pbkdf2(bufferify(password), bufferify(salt), iterations, keylen, hashAlgorithm));
}
//# sourceMappingURL=index.js.map