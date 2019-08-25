"use strict";
import aes from "aes-js";
import scrypt from "scrypt-js";
import uuid from "uuid";
import { getAddress } from "@ethersproject/address";
import { arrayify, concat, hexlify } from "@ethersproject/bytes";
import { defaultPath, entropyToMnemonic, HDNode, mnemonicToEntropy } from "@ethersproject/hdnode";
import { keccak256 } from "@ethersproject/keccak256";
import { pbkdf2 } from "@ethersproject/pbkdf2";
import { randomBytes } from "@ethersproject/random";
import { Description } from "@ethersproject/properties";
import { computeAddress } from "@ethersproject/transactions";
import { getPassword, looseArrayify, searchPath, zpad } from "./utils";
// Exported Types
export class KeystoreAccount extends Description {
    isKeystoreAccount(value) {
        return !!(value && value._isKeystoreAccount);
    }
}
export function decrypt(json, password, progressCallback) {
    let data = JSON.parse(json);
    let passwordBytes = getPassword(password);
    let decrypt = function (key, ciphertext) {
        let cipher = searchPath(data, "crypto/cipher");
        if (cipher === "aes-128-ctr") {
            let iv = looseArrayify(searchPath(data, "crypto/cipherparams/iv"));
            let counter = new aes.Counter(iv);
            let aesCtr = new aes.ModeOfOperation.ctr(key, counter);
            return arrayify(aesCtr.decrypt(ciphertext));
        }
        return null;
    };
    let computeMAC = function (derivedHalf, ciphertext) {
        return keccak256(concat([derivedHalf, ciphertext]));
    };
    let getAccount = function (key, reject) {
        let ciphertext = looseArrayify(searchPath(data, "crypto/ciphertext"));
        let computedMAC = hexlify(computeMAC(key.slice(16, 32), ciphertext)).substring(2);
        if (computedMAC !== searchPath(data, "crypto/mac").toLowerCase()) {
            reject(new Error("invalid password"));
            return null;
        }
        let privateKey = decrypt(key.slice(0, 16), ciphertext);
        let mnemonicKey = key.slice(32, 64);
        if (!privateKey) {
            reject(new Error("unsupported cipher"));
            return null;
        }
        let address = computeAddress(privateKey);
        if (data.address) {
            let check = data.address.toLowerCase();
            if (check.substring(0, 2) !== "0x") {
                check = "0x" + check;
            }
            try {
                if (getAddress(check) !== address) {
                    reject(new Error("address mismatch"));
                    return null;
                }
            }
            catch (e) { }
        }
        let account = {
            _isKeystoreAccount: true,
            address: address,
            privateKey: hexlify(privateKey)
        };
        // Version 0.1 x-ethers metadata must contain an encrypted mnemonic phrase
        if (searchPath(data, "x-ethers/version") === "0.1") {
            let mnemonicCiphertext = looseArrayify(searchPath(data, "x-ethers/mnemonicCiphertext"));
            let mnemonicIv = looseArrayify(searchPath(data, "x-ethers/mnemonicCounter"));
            let mnemonicCounter = new aes.Counter(mnemonicIv);
            let mnemonicAesCtr = new aes.ModeOfOperation.ctr(mnemonicKey, mnemonicCounter);
            let path = searchPath(data, "x-ethers/path") || defaultPath;
            let entropy = arrayify(mnemonicAesCtr.decrypt(mnemonicCiphertext));
            let mnemonic = entropyToMnemonic(entropy);
            let node = HDNode.fromMnemonic(mnemonic).derivePath(path);
            if (node.privateKey != account.privateKey) {
                reject(new Error("mnemonic mismatch"));
                return null;
            }
            account.mnemonic = node.mnemonic;
            account.path = node.path;
        }
        return new KeystoreAccount(account);
    };
    return new Promise(function (resolve, reject) {
        let kdf = searchPath(data, "crypto/kdf");
        if (kdf && typeof (kdf) === "string") {
            if (kdf.toLowerCase() === "scrypt") {
                let salt = looseArrayify(searchPath(data, "crypto/kdfparams/salt"));
                let N = parseInt(searchPath(data, "crypto/kdfparams/n"));
                let r = parseInt(searchPath(data, "crypto/kdfparams/r"));
                let p = parseInt(searchPath(data, "crypto/kdfparams/p"));
                if (!N || !r || !p) {
                    reject(new Error("unsupported key-derivation function parameters"));
                    return;
                }
                // Make sure N is a power of 2
                if ((N & (N - 1)) !== 0) {
                    reject(new Error("unsupported key-derivation function parameter value for N"));
                    return;
                }
                let dkLen = parseInt(searchPath(data, "crypto/kdfparams/dklen"));
                if (dkLen !== 32) {
                    reject(new Error("unsupported key-derivation derived-key length"));
                    return;
                }
                if (progressCallback) {
                    progressCallback(0);
                }
                scrypt(passwordBytes, salt, N, r, p, 64, function (error, progress, key) {
                    if (error) {
                        error.progress = progress;
                        reject(error);
                    }
                    else if (key) {
                        key = arrayify(key);
                        let account = getAccount(key, reject);
                        if (!account) {
                            return;
                        }
                        if (progressCallback) {
                            progressCallback(1);
                        }
                        resolve(account);
                    }
                    else if (progressCallback) {
                        return progressCallback(progress);
                    }
                });
            }
            else if (kdf.toLowerCase() === "pbkdf2") {
                let salt = looseArrayify(searchPath(data, "crypto/kdfparams/salt"));
                let prfFunc = null;
                let prf = searchPath(data, "crypto/kdfparams/prf");
                if (prf === "hmac-sha256") {
                    prfFunc = "sha256";
                }
                else if (prf === "hmac-sha512") {
                    prfFunc = "sha512";
                }
                else {
                    reject(new Error("unsupported prf"));
                    return;
                }
                let c = parseInt(searchPath(data, "crypto/kdfparams/c"));
                let dkLen = parseInt(searchPath(data, "crypto/kdfparams/dklen"));
                if (dkLen !== 32) {
                    reject(new Error("unsupported key-derivation derived-key length"));
                    return;
                }
                let key = arrayify(pbkdf2(passwordBytes, salt, c, dkLen, prfFunc));
                let account = getAccount(key, reject);
                if (!account) {
                    return;
                }
                resolve(account);
            }
            else {
                reject(new Error("unsupported key-derivation function"));
            }
        }
        else {
            reject(new Error("unsupported key-derivation function"));
        }
    });
}
export function encrypt(account, password, options, progressCallback) {
    try {
        if (getAddress(account.address) !== computeAddress(account.privateKey)) {
            throw new Error("address/privateKey mismatch");
        }
        if (account.mnemonic != null) {
            let node = HDNode.fromMnemonic(account.mnemonic).derivePath(account.path || defaultPath);
            if (node.privateKey != account.privateKey) {
                throw new Error("mnemonic mismatch");
            }
        }
        else if (account.path != null) {
            throw new Error("cannot specify path without mnemonic");
        }
    }
    catch (e) {
        return Promise.reject(e);
    }
    // the options are optional, so adjust the call as needed
    if (typeof (options) === "function" && !progressCallback) {
        progressCallback = options;
        options = {};
    }
    if (!options) {
        options = {};
    }
    let privateKey = arrayify(account.privateKey);
    let passwordBytes = getPassword(password);
    let entropy = null;
    let path = account.path;
    if (account.mnemonic) {
        entropy = arrayify(mnemonicToEntropy(account.mnemonic));
        if (!path) {
            path = defaultPath;
        }
    }
    let client = options.client;
    if (!client) {
        client = "ethers.js";
    }
    // Check/generate the salt
    let salt = null;
    if (options.salt) {
        salt = arrayify(options.salt);
    }
    else {
        salt = randomBytes(32);
        ;
    }
    // Override initialization vector
    let iv = null;
    if (options.iv) {
        iv = arrayify(options.iv);
        if (iv.length !== 16) {
            throw new Error("invalid iv");
        }
    }
    else {
        iv = randomBytes(16);
    }
    // Override the uuid
    let uuidRandom = null;
    if (options.uuid) {
        uuidRandom = arrayify(options.uuid);
        if (uuidRandom.length !== 16) {
            throw new Error("invalid uuid");
        }
    }
    else {
        uuidRandom = randomBytes(16);
    }
    // Override the scrypt password-based key derivation function parameters
    let N = (1 << 17), r = 8, p = 1;
    if (options.scrypt) {
        if (options.scrypt.N) {
            N = options.scrypt.N;
        }
        if (options.scrypt.r) {
            r = options.scrypt.r;
        }
        if (options.scrypt.p) {
            p = options.scrypt.p;
        }
    }
    return new Promise(function (resolve, reject) {
        if (progressCallback) {
            progressCallback(0);
        }
        // We take 64 bytes:
        //   - 32 bytes   As normal for the Web3 secret storage (derivedKey, macPrefix)
        //   - 32 bytes   AES key to encrypt mnemonic with (required here to be Ethers Wallet)
        scrypt(passwordBytes, salt, N, r, p, 64, function (error, progress, key) {
            if (error) {
                error.progress = progress;
                reject(error);
            }
            else if (key) {
                key = arrayify(key);
                // This will be used to encrypt the wallet (as per Web3 secret storage)
                let derivedKey = key.slice(0, 16);
                let macPrefix = key.slice(16, 32);
                // This will be used to encrypt the mnemonic phrase (if any)
                let mnemonicKey = key.slice(32, 64);
                // Encrypt the private key
                let counter = new aes.Counter(iv);
                let aesCtr = new aes.ModeOfOperation.ctr(derivedKey, counter);
                let ciphertext = arrayify(aesCtr.encrypt(privateKey));
                // Compute the message authentication code, used to check the password
                let mac = keccak256(concat([macPrefix, ciphertext]));
                // See: https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition
                let data = {
                    address: account.address.substring(2).toLowerCase(),
                    id: uuid.v4({ random: uuidRandom }),
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
                if (entropy) {
                    let mnemonicIv = randomBytes(16);
                    let mnemonicCounter = new aes.Counter(mnemonicIv);
                    let mnemonicAesCtr = new aes.ModeOfOperation.ctr(mnemonicKey, mnemonicCounter);
                    let mnemonicCiphertext = arrayify(mnemonicAesCtr.encrypt(entropy));
                    let now = new Date();
                    let timestamp = (now.getUTCFullYear() + "-" +
                        zpad(now.getUTCMonth() + 1, 2) + "-" +
                        zpad(now.getUTCDate(), 2) + "T" +
                        zpad(now.getUTCHours(), 2) + "-" +
                        zpad(now.getUTCMinutes(), 2) + "-" +
                        zpad(now.getUTCSeconds(), 2) + ".0Z");
                    data["x-ethers"] = {
                        client: client,
                        gethFilename: ("UTC--" + timestamp + "--" + data.address),
                        mnemonicCounter: hexlify(mnemonicIv).substring(2),
                        mnemonicCiphertext: hexlify(mnemonicCiphertext).substring(2),
                        path: path,
                        version: "0.1"
                    };
                }
                if (progressCallback) {
                    progressCallback(1);
                }
                resolve(JSON.stringify(data));
            }
            else if (progressCallback) {
                return progressCallback(progress);
            }
        });
    });
}
