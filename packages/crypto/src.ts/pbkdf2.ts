import { pbkdf2Sync } from "crypto"; /*-browser*/

import { hexlify } from "@ethersproject/bytes";

import { logger } from "./logger.js";

import type { BytesLike } from "@ethersproject/logger";

let locked = false;

const _pbkdf2 = function(password: Uint8Array, salt: Uint8Array, iterations: number, keylen: number, algo: "sha256" | "sha512"): BytesLike {
    return pbkdf2Sync(password, salt, iterations, keylen, algo);
}

let __pbkdf2 = _pbkdf2;

export function pbkdf2(_password: BytesLike, _salt: BytesLike, iterations: number, keylen: number, algo: "sha256" | "sha512"): string {
    const password = logger.getBytes(_password, "password");
    const salt = logger.getBytes(_salt, "salt");
    return hexlify(__pbkdf2(password, salt, iterations, keylen, algo));
}
pbkdf2._ = _pbkdf2;
pbkdf2.lock = function(): void { locked = true; }
pbkdf2.register = function(func: (password: Uint8Array, salt: Uint8Array, iterations: number, keylen: number, algo: "sha256" | "sha512") => BytesLike) {
    if (locked) { throw new Error("pbkdf2 is locked"); }
    __pbkdf2 = func;
}
Object.freeze(pbkdf2);
