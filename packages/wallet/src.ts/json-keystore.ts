import { CTR } from "aes-js";

import { getAddress } from "@ethersproject/address";
import { arrayify, concat, hexlify } from "@ethersproject/bytes";
import { keccak256, pbkdf2, randomBytes, scrypt, scryptSync } from "@ethersproject/crypto";
import { computeAddress } from "@ethersproject/transaction";

import { logger } from "./logger.js";

import { getPassword, spelunk, uuidV4, zpad } from "./utils.js";

import type { ProgressCallback } from "@ethersproject/crypto";
import type { BytesLike } from "@ethersproject/logger";

import { version } from "./_version.js";

const defaultPath = "m/44'/60'/0'/0/0";


export type KeystoreAccountParams = {
    privateKey: string;
    address?: string;
    mnemonic?: {
        entropy: string;
        path: string;
        locale: string;
    };
};

export type KeystoreAccount = {
    address: string;
    privateKey: string;
    mnemonic?: {
        entropy: string;
        path: string;
        locale: string;
    };
};

export type EncryptOptions = {
   iv?: BytesLike;
   entropy?: BytesLike;
   client?: string;
   salt?: BytesLike;
   uuid?: string;
   scrypt?: {
       N?: number;
       r?: number;
       p?: number;
   }
}

export function isKeystoreJson(json: string): boolean {
    try {
        const data = JSON.parse(json);
        const version = ((data.version != null) ? parseInt(data.version): 0);
        if (version === 3) { return true; }
    } catch (error) { }
    return false;
}

function decrypt(data: any, key: Uint8Array, ciphertext: Uint8Array): string {
    const cipher = spelunk(data, "crypto.cipher:string");
    if (cipher === "aes-128-ctr") {
        const iv = spelunk<Uint8Array>(data, "crypto.cipherparams.iv:data!")
        const aesCtr = new CTR(key, iv);
        return hexlify(aesCtr.decrypt(ciphertext));
    }

    return logger.throwError("unsupported cipher", "UNSUPPORTED_OPERATION", {
        operation: "decrypt"
    });
}

function getAccount(data: any, _key: string): KeystoreAccount {
    const key = logger.getBytes(_key);
    const ciphertext = spelunk<Uint8Array>(data, "crypto.ciphertext:data!");

    const computedMAC = hexlify(keccak256(concat([ key.slice(16, 32), ciphertext ]))).substring(2);
    if (computedMAC !== spelunk(data, "crypto.mac:string!").toLowerCase()) {
        return logger.throwArgumentError("incorrect password", "password", "[ REDACTED ]");
    }

    const privateKey = decrypt(data, key.slice(0, 16), ciphertext);

    const address = computeAddress(privateKey);
    if (data.address) {
        let check = data.address.toLowerCase();
        if (check.substring(0, 2) !== "0x") { check = "0x" + check; }

        if (getAddress(check) !== address) {
            logger.throwArgumentError("keystore address/privateKey mismatch", "address", data.address);
        }
    }

    const account: KeystoreAccount = { address, privateKey };

    // Version 0.1 x-ethers metadata must contain an encrypted mnemonic phrase
    const version = spelunk(data, "x-ethers.version:string");
    if (version === "0.1") {
        const mnemonicKey = key.slice(32, 64);

        const mnemonicCiphertext = spelunk<Uint8Array>(data, "x-ethers.mnemonicCiphertext:data!");
        const mnemonicIv = spelunk<Uint8Array>(data, "x-ethers.mnemonicCounter:data!");

        const mnemonicAesCtr = new CTR(mnemonicKey, mnemonicIv);

        account.mnemonic = {
            path: (spelunk<null | string>(data, "x-ethers.path:string") || defaultPath),
            locale: (spelunk<null | string>(data, "x-ethers.locale:string") || "en"),
            entropy: hexlify(arrayify(mnemonicAesCtr.decrypt(mnemonicCiphertext)))
        };
    }

    return account;
}

type KdfParams = {
    name: "scrypt";
    salt: Uint8Array;
    N: number;
    r: number;
    p: number;
    dkLen: number;
} | {
    name: "pbkdf2";
    salt: Uint8Array;
    count: number;
    dkLen: number;
    algorithm: "sha256" | "sha512";
};

function getKdfParams<T>(data: any): KdfParams {
    const kdf = spelunk(data, "crypto.kdf:string");
    if (kdf && typeof(kdf) === "string") {
        const throwError = function(name: string, value: any): never {
            return logger.throwArgumentError("invalid key-derivation function parameters", name, value);
        }

        if (kdf.toLowerCase() === "scrypt") {
            const salt = spelunk<Uint8Array>(data, "crypto.kdfparams.salt:data!");
            const N = spelunk<number>(data, "crypto.kdfparams.n:int!");
            const r = spelunk<number>(data, "crypto.kdfparams.r:int!");
            const p = spelunk<number>(data, "crypto.kdfparams.p:int!");

            // Check for all required parameters
            if (!N || !r || !p) { return throwError("kdf", kdf); }

            // Make sure N is a power of 2
            if ((N & (N - 1)) !== 0) { return throwError("N", N); }

            const dkLen = spelunk<number>(data, "crypto.kdfparams.dklen:int!");
            if (dkLen !== 32) { return throwError("dklen", dkLen); }

            return { name: "scrypt", salt, N, r, p, dkLen: 64 };

        } else if (kdf.toLowerCase() === "pbkdf2") {

            const salt = spelunk<Uint8Array>(data, "crypto.kdfparams.salt:data!");

            const prf = spelunk(data, "crypto.kdfparams.prf:string!");
            const algorithm = prf.split("-").pop();
            if (algorithm !== "sha256" && algorithm !== "sha512") {
                return throwError("prf", prf);
            }

            const count = spelunk<number>(data, "crypto.kdfparams.c:int!");

            const dkLen = spelunk<number>(data, "crypto.kdfparams.dklen:int!");
            if (dkLen !== 32) { throwError("dklen", dkLen); }

            return { name: "pbkdf2", salt, count, dkLen, algorithm };
        }
    }

    return logger.throwArgumentError("unsupported key-derivation function", "kdf", kdf);
}


export function decryptKeystoreJsonSync(json: string, _password: string | Uint8Array): KeystoreAccount {
    const data = JSON.parse(json);

    const password = getPassword(_password);

    const params = getKdfParams(data);
    if (params.name === "pbkdf2") {
        const { salt, count, dkLen, algorithm } = params;
        const key = pbkdf2(password, salt, count, dkLen, algorithm);
        return getAccount(data, key);
    } else if (params.name === "scrypt") {
        const { salt, N, r, p, dkLen } = params;
        const key = scryptSync(password, salt, N, r, p, dkLen);
        return getAccount(data, key);
    }

    throw new Error("unreachable");
}

function stall(duration: number): Promise<void> {
    return new Promise((resolve) => { setTimeout(() => { resolve(); }, duration); });
}

export async function decryptKeystoreJson(json: string, _password: string | Uint8Array, progress?: ProgressCallback): Promise<KeystoreAccount> {
    const data = JSON.parse(json);

    const password = getPassword(_password);

    const params = getKdfParams(data);
    if (params.name === "pbkdf2") {
        if (progress) {
            progress(0);
            await stall(0);
        }
        const { salt, count, dkLen, algorithm } = params;
        const key = pbkdf2(password, salt, count, dkLen, algorithm);
        if (progress) {
            progress(1);
            await stall(0);
        }
        return getAccount(data, key);
    } else if (params.name === "scrypt") {
        const { salt, N, r, p, dkLen } = params;
        const key = await scrypt(password, salt, N, r, p, dkLen, progress);
        return getAccount(data, key);
    }

    throw new Error("unreachable");
}


export async function encryptKeystoreJson(account: KeystoreAccount, password: string | Uint8Array, options?: EncryptOptions, progressCallback?: ProgressCallback): Promise<string> {

    // Check the address matches the private key
    //if (getAddress(account.address) !== computeAddress(account.privateKey)) {
    //    throw new Error("address/privateKey mismatch");
    //}

    // Check the mnemonic (if any) matches the private key
    /*
    if (hasMnemonic(account)) {
        const mnemonic = account.mnemonic;
        const node = HDNode.fromMnemonic(mnemonic.phrase, null, mnemonic.locale).derivePath(mnemonic.path || defaultPath);

        if (node.privateKey != account.privateKey) {
            throw new Error("mnemonic mismatch");
        }
    }
    */

    // The options are optional, so adjust the call as needed
    if (typeof(options) === "function" && !progressCallback) {
        progressCallback = options;
        options = {};
    }
    if (!options) { options = {}; }

    const privateKey = logger.getBytes(account.privateKey, "privateKey");
    const passwordBytes = getPassword(password);

/*
    let mnemonic: null | Mnemonic = null;
    let entropy: Uint8Array = null
    let path: string = null;
    let locale: string = null;
    if (hasMnemonic(account)) {
        const srcMnemonic = account.mnemonic;
        entropy = arrayify(mnemonicToEntropy(srcMnemonic.phrase, srcMnemonic.locale || "en"));
        path = srcMnemonic.path || defaultPath;
        locale = srcMnemonic.locale || "en";
        mnemonic = Mnemonic.from(
    }
*/
    // Check/generate the salt
    const salt = (options.salt != null) ? logger.getBytes(options.salt, "options.slat"): randomBytes(32);

    // Override initialization vector
    const iv = (options.iv != null) ? logger.getBytes(options.iv, "options.iv"): randomBytes(16);
    if (iv.length !== 16) {
        logger.throwArgumentError("invalid options.iv", "options.iv", options.iv);
    }

    // Override the uuid
    const uuidRandom = (options.uuid != null) ? logger.getBytes(options.uuid, "options.uuid"): randomBytes(16);
    if (uuidRandom.length !== 16) {
        logger.throwArgumentError("invalid options.uuid", "options.uuid", options.iv);
    }
    if (uuidRandom.length !== 16) { throw new Error("invalid uuid"); }

    // Override the scrypt password-based key derivation function parameters
    let N = (1 << 17), r = 8, p = 1;
    if (options.scrypt) {
        if (options.scrypt.N) { N = options.scrypt.N; }
        if (options.scrypt.r) { r = options.scrypt.r; }
        if (options.scrypt.p) { p = options.scrypt.p; }
    }

    // We take 64 bytes:
    //   - 32 bytes   As normal for the Web3 secret storage (derivedKey, macPrefix)
    //   - 32 bytes   AES key to encrypt mnemonic with (required here to be Ethers Wallet)
    const _key = await scrypt(passwordBytes, salt, N, r, p, 64, progressCallback);
    const key = arrayify(_key);

    // This will be used to encrypt the wallet (as per Web3 secret storage)
    const derivedKey = key.slice(0, 16);
    const macPrefix = key.slice(16, 32);

    // Encrypt the private key
    const aesCtr = new CTR(derivedKey, iv);
    const ciphertext = arrayify(aesCtr.encrypt(privateKey));

    // Compute the message authentication code, used to check the password
    const mac = keccak256(concat([ macPrefix, ciphertext ]))

    // See: https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition
    const data: { [key: string]: any } = {
        address: account.address.substring(2).toLowerCase(),
        id: uuidV4(uuidRandom),
        version: 3,
        Crypto: {
            cipher: "aes-128-ctr",
            cipherparams: {
                iv: hexlify(iv).substring(2),
            },
            ciphertext: hexlify(ciphertext).substring(2),
            kdf: "scrypt",
            kdfparams: {
                salt: hexlify(salt).substring(2),
                n: N,
                dklen: 32,
                p: p,
                r: r
            },
            mac: mac.substring(2)
        }
    };

    // If we have a mnemonic, encrypt it into the JSON wallet
    if (account.mnemonic) {
        const client = (options.client != null) ? options.client: `ethers/${ version }`;

        const path = account.mnemonic.path || defaultPath;
        const locale = account.mnemonic.locale || "en";

        const mnemonicKey = key.slice(32, 64);

        const entropy = logger.getBytes(account.mnemonic.entropy, "account.mnemonic.entropy");
        const mnemonicIv = randomBytes(16);
        const mnemonicAesCtr = new CTR(mnemonicKey, mnemonicIv);
        const mnemonicCiphertext = arrayify(mnemonicAesCtr.encrypt(entropy));

        const now = new Date();
        const timestamp = (now.getUTCFullYear() + "-" +
                           zpad(now.getUTCMonth() + 1, 2) + "-" +
                           zpad(now.getUTCDate(), 2) + "T" +
                           zpad(now.getUTCHours(), 2) + "-" +
                           zpad(now.getUTCMinutes(), 2) + "-" +
                           zpad(now.getUTCSeconds(), 2) + ".0Z");
        const gethFilename = ("UTC--" + timestamp + "--" + data.address);

        data["x-ethers"] = {
            client, gethFilename, path, locale,
            mnemonicCounter: hexlify(mnemonicIv).substring(2),
            mnemonicCiphertext: hexlify(mnemonicCiphertext).substring(2),
            version: "0.1"
        };
    }

    return JSON.stringify(data);
}
