import { scrypt as _nobleSync, scryptAsync as _nobleAsync } from "@noble/hashes/scrypt";

import { getBytes, hexlify as H } from "../utils/index.js";

import type { BytesLike } from "../utils/index.js";


export type ProgressCallback = (percent: number) => void;


let lockedSync = false, lockedAsync = false;

const _scryptAsync = async function(passwd: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number, onProgress?: ProgressCallback) {
    return await _nobleAsync(passwd, salt, { N, r, p, dkLen, onProgress });
}
const _scryptSync = function(passwd: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number) {
    return _nobleSync(passwd, salt, { N, r, p, dkLen });
}

let __scryptAsync: (passwd: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number, onProgress?: ProgressCallback) => Promise<BytesLike> = _scryptAsync;
let __scryptSync: (passwd: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number) => BytesLike = _scryptSync


export async function scrypt(_passwd: BytesLike, _salt: BytesLike, N: number, r: number, p: number, dkLen: number, progress?: ProgressCallback): Promise<string> {
    const passwd = getBytes(_passwd, "passwd");
    const salt = getBytes(_salt, "salt");
    return H(await __scryptAsync(passwd, salt, N, r, p, dkLen, progress));
}
scrypt._ = _scryptAsync;
scrypt.lock = function(): void { lockedAsync = true; }
scrypt.register = function(func: (passwd: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number, progress?: ProgressCallback) => Promise<BytesLike>) {
    if (lockedAsync) { throw new Error("scrypt is locked"); }
    __scryptAsync = func;
}
Object.freeze(scrypt);

export function scryptSync(_passwd: BytesLike, _salt: BytesLike, N: number, r: number, p: number, dkLen: number): string {
    const passwd = getBytes(_passwd, "passwd");
    const salt = getBytes(_salt, "salt");
    return H(__scryptSync(passwd, salt, N, r, p, dkLen));
}
scryptSync._ = _scryptSync;
scryptSync.lock = function(): void { lockedSync = true; }
scryptSync.register = function(func: (passwd: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number) => BytesLike) {
    if (lockedSync) { throw new Error("scryptSync is locked"); }
    __scryptSync = func;
}
Object.freeze(scryptSync);
