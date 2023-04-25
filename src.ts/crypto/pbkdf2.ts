/**
 *  A **Password-Based Key-Derivation Function** is designed to create
 *  a sequence of bytes suitible as a **key** from a human-rememberable
 *  password.
 *
 *  @_subsection: api/crypto:Passwords  [about-pbkdf]
 */

import { pbkdf2Sync, pbkdf2 as pbkdf2_Async  } from "./crypto.js";

import { getBytes, hexlify } from "../utils/index.js";

import type { BytesLike } from "../utils/index.js";


let lockedSync = false, lockedAsync = false;

const _pbkdf2 = function(password: Uint8Array, salt: Uint8Array, iterations: number, keylen: number, algo: "sha256" | "sha512"): BytesLike {
    return pbkdf2Sync(password, salt, iterations, keylen, algo);
}

const _pbkdf2Async = function(password: Uint8Array, salt: Uint8Array, iterations: number, keylen: number, algo: "sha256" | "sha512"): Promise<BytesLike> {
    return new Promise((resolve,reject)=>{
        pbkdf2_Async(password, salt, iterations, keylen, algo , (err, derivedKey)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(derivedKey);
            }
        })
    })
}

let __pbkdf2 = _pbkdf2;
let __pbkdf2Async = _pbkdf2Async;

/**
 *  Return the [[link-pbkdf2]] for %%keylen%% bytes for %%password%% using
 *  the %%salt%% and using %%iterations%% of %%algo%%.
 *
 *  This PBKDF is outdated and should not be used in new projects, but is
 *  required to decrypt older files.
 *
 *  @example:
 *    // The password must be converted to bytes, and it is generally
 *    // best practices to ensure the string has been normalized. Many
 *    // formats explicitly indicate the normalization form to use.
 *    password = "hello"
 *    passwordBytes = toUtf8Bytes(password, "NFKC")
 *
 *    salt = id("some-salt")
 *
 *    // Compute the PBKDF2
 *    pbkdf2(passwordBytes, salt, 1024, 16, "sha256")
 *    //_result:
 */
export function pbkdf2(_password: BytesLike, _salt: BytesLike, iterations: number, keylen: number, algo: "sha256" | "sha512"): string {
    const password = getBytes(_password, "password");
    const salt = getBytes(_salt, "salt");
    return hexlify(__pbkdf2(password, salt, iterations, keylen, algo));
}
export async function pbkdf2Async(_password: BytesLike, _salt: BytesLike, iterations: number, keylen: number, algo: "sha256" | "sha512"): Promise<string> {
    const password = getBytes(_password, "password");
    const salt = getBytes(_salt, "salt");
    return hexlify(await __pbkdf2Async(password, salt, iterations, keylen, algo));
}

pbkdf2._ = _pbkdf2;
pbkdf2.lock = function(): void { lockedSync = true; }
pbkdf2.register = function(func: (password: Uint8Array, salt: Uint8Array, iterations: number, keylen: number, algo: "sha256" | "sha512") => BytesLike) {
    if (lockedSync) { throw new Error("pbkdf2 is locked"); }
    __pbkdf2 = func;
}
Object.freeze(pbkdf2);

pbkdf2Async._ = _pbkdf2Async;
pbkdf2Async.lock = function(): void { lockedAsync = true; }
pbkdf2Async.register = function(func: (password: Uint8Array, salt: Uint8Array, iterations: number, keylen: number, algo: "sha256" | "sha512") => Promise<BytesLike>) {
    if (lockedAsync) { throw new Error("pbkdf2Async is locked"); }
    __pbkdf2Async = func;
}
Object.freeze(pbkdf2Async);