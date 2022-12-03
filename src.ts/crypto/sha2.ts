import { createHash } from "./crypto.js";

import { getBytes, hexlify } from "../utils/index.js";

import type { BytesLike } from "../utils/index.js";


const _sha256 = function(data: Uint8Array): Uint8Array {
    return createHash("sha256").update(data).digest();
}

const _sha512 = function(data: Uint8Array): Uint8Array {
    return createHash("sha512").update(data).digest();
}

let __sha256: (data: Uint8Array) => BytesLike = _sha256;
let __sha512: (data: Uint8Array) => BytesLike = _sha512;

let locked256 = false, locked512 = false;


/**
 *  Compute the cryptographic SHA2-256 hash of %%data%%.
 *
 *  @_docloc: api/crypto:Hash Functions
 *  @returns DataHexstring
 */
export function sha256(_data: BytesLike): string {
    const data = getBytes(_data, "data");
    return hexlify(__sha256(data));
}
sha256._ = _sha256;
sha256.lock = function(): void { locked256 = true; }
sha256.register = function(func: (data: Uint8Array) => BytesLike): void {
    if (locked256) { throw new Error("sha256 is locked"); }
    __sha256 = func;
}
Object.freeze(sha256);


/**
 *  Compute the cryptographic SHA2-512 hash of %%data%%.
 *
 *  @_docloc: api/crypto:Hash Functions
 *  @returns DataHexstring
 */
export function sha512(_data: BytesLike): string {
    const data = getBytes(_data, "data");
    return hexlify(__sha512(data));
}
sha512._ = _sha512;
sha512.lock = function(): void { locked512 = true; }
sha512.register = function(func: (data: Uint8Array) => BytesLike): void {
    if (locked512) { throw new Error("sha512 is locked"); }
    __sha512 = func;
}
Object.freeze(sha256);
