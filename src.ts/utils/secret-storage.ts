'use strict';

import aes from 'aes-js';
import scrypt from 'scrypt-js';
import uuid from 'uuid';

import { SigningKey } from './signing-key';
import * as HDNode from './hdnode';

import { getAddress } from './address';
import { arrayify, concat, hexlify } from './bytes';
import { pbkdf2 } from './pbkdf2';
import { keccak256 } from './keccak256';
import { toUtf8Bytes, UnicodeNormalizationForm } from './utf8';
import { randomBytes } from './random-bytes';

// Imported Types
import { Arrayish } from './bytes';


// Exported Types
export type ProgressCallback = (percent: number) => void;

export type EncryptOptions = {
   iv?: Arrayish;
   entropy?: Arrayish;
   mnemonic?: string;
   path?: string;
   client?: string;
   salt?: Arrayish;
   uuid?: string;
   scrypt?: {
       N?: number;
       r?: number;
       p?: number;
   }
}


function looseArrayify(hexString: string): Uint8Array {
    if (typeof(hexString) === 'string' && hexString.substring(0, 2) !== '0x') {
        hexString = '0x' + hexString;
    }
    return arrayify(hexString);
}

function zpad(value: String | number, length: number): String {
    value = String(value);
    while (value.length < length) { value = '0' + value; }
    return value;
}

function getPassword(password: Arrayish): Uint8Array {
    if (typeof(password) === 'string') {
        return toUtf8Bytes(password, UnicodeNormalizationForm.NFKC);
    }
    return arrayify(password);
}

// Search an Object and its children recursively, caselessly.
function searchPath(object: any, path: string): string {
    var currentChild = object;

    var comps = path.toLowerCase().split('/');
    for (var i = 0; i < comps.length; i++) {

        // Search for a child object with a case-insensitive matching key
        var matchingChild = null;
        for (var key in currentChild) {
             if (key.toLowerCase() === comps[i]) {
                 matchingChild = currentChild[key];
                 break;
             }
        }

        // Didn't find one. :'(
        if (matchingChild === null) {
            return null;
        }

        // Now check this child...
        currentChild = matchingChild;
    }

    return currentChild;
}


// @TODO: Make a type for string or arrayish
// See: https://github.com/ethereum/pyethsaletool
export function decryptCrowdsale(json: string, password: Arrayish | string): SigningKey {
    var data = JSON.parse(json);

    password = getPassword(password);

    // Ethereum Address
    var ethaddr = getAddress(searchPath(data, 'ethaddr'));

    // Encrypted Seed
    var encseed = looseArrayify(searchPath(data, 'encseed'));
    if (!encseed || (encseed.length % 16) !== 0) {
        throw new Error('invalid encseed');
    }

    let key = pbkdf2(password, password, 2000, 32, 'sha256').slice(0, 16);

    var iv = encseed.slice(0, 16);
    var encryptedSeed = encseed.slice(16);

    // Decrypt the seed
    var aesCbc = new aes.ModeOfOperation.cbc(key, iv);
    var seed = arrayify(aesCbc.decrypt(encryptedSeed));
    seed = aes.padding.pkcs7.strip(seed);

    // This wallet format is weird... Convert the binary encoded hex to a string.
    var seedHex = '';
    for (var i = 0; i < seed.length; i++) {
        seedHex += String.fromCharCode(seed[i]);
    }

    var seedHexBytes = toUtf8Bytes(seedHex);

    var signingKey = new SigningKey(keccak256(seedHexBytes));

    if (signingKey.address !== ethaddr) {
        throw new Error('corrupt crowdsale wallet');
    }

    return signingKey;
}

//@TODO: string or arrayish
export function decrypt(json: string, password: Arrayish, progressCallback?: ProgressCallback): Promise<SigningKey> {
    var data = JSON.parse(json);

    let passwordBytes = getPassword(password);

    var decrypt = function(key: Uint8Array, ciphertext: Uint8Array): Uint8Array {
        var cipher = searchPath(data, 'crypto/cipher');
        if (cipher === 'aes-128-ctr') {
            var iv = looseArrayify(searchPath(data, 'crypto/cipherparams/iv'))
            var counter = new aes.Counter(iv);

            var aesCtr = new aes.ModeOfOperation.ctr(key, counter);

            return arrayify(aesCtr.decrypt(ciphertext));
        }

        return null;
    };

    var computeMAC = function(derivedHalf: Uint8Array, ciphertext: Uint8Array) {
        return keccak256(concat([derivedHalf, ciphertext]));
    }

    var getSigningKey = function(key: Uint8Array, reject: (error?: Error) => void) {
        var ciphertext = looseArrayify(searchPath(data, 'crypto/ciphertext'));

        var computedMAC = hexlify(computeMAC(key.slice(16, 32), ciphertext)).substring(2);
        if (computedMAC !== searchPath(data, 'crypto/mac').toLowerCase()) {
            reject(new Error('invalid password'));
            return null;
        }

        var privateKey = decrypt(key.slice(0, 16), ciphertext);
        var mnemonicKey = key.slice(32, 64);

        if (!privateKey) {
            reject(new Error('unsupported cipher'));
            return null;
        }

        var signingKey = new SigningKey(privateKey);
        if (signingKey.address !== getAddress(data.address)) {
            reject(new Error('address mismatch'));
            return null;
        }

        // Version 0.1 x-ethers metadata must contain an encrypted mnemonic phrase
        if (searchPath(data, 'x-ethers/version') === '0.1') {
            var mnemonicCiphertext = looseArrayify(searchPath(data, 'x-ethers/mnemonicCiphertext'));
            var mnemonicIv = looseArrayify(searchPath(data, 'x-ethers/mnemonicCounter'));

            var mnemonicCounter = new aes.Counter(mnemonicIv);
            var mnemonicAesCtr = new aes.ModeOfOperation.ctr(mnemonicKey, mnemonicCounter);

            var path = searchPath(data, 'x-ethers/path') || HDNode.defaultPath;

            var entropy = arrayify(mnemonicAesCtr.decrypt(mnemonicCiphertext));
            var mnemonic = HDNode.entropyToMnemonic(entropy);

            var node = HDNode.fromMnemonic(mnemonic).derivePath(path);
            if (node.privateKey != hexlify(privateKey)) {
                reject(new Error('mnemonic mismatch'));
                return null;
            }

            signingKey = new SigningKey(node);
        }

        return signingKey;
    }


    return new Promise(function(resolve, reject) {
        var kdf = searchPath(data, 'crypto/kdf');
        if (kdf && typeof(kdf) === 'string') {
            if (kdf.toLowerCase() === 'scrypt') {
                var salt = looseArrayify(searchPath(data, 'crypto/kdfparams/salt'));
                var N = parseInt(searchPath(data, 'crypto/kdfparams/n'));
                var r = parseInt(searchPath(data, 'crypto/kdfparams/r'));
                var p = parseInt(searchPath(data, 'crypto/kdfparams/p'));
                if (!N || !r || !p) {
                    reject(new Error('unsupported key-derivation function parameters'));
                    return;
                }

                // Make sure N is a power of 2
                if ((N & (N - 1)) !== 0) {
                    reject(new Error('unsupported key-derivation function parameter value for N'));
                    return;
                }

                var dkLen = parseInt(searchPath(data, 'crypto/kdfparams/dklen'));
                if (dkLen !== 32) {
                    reject( new Error('unsupported key-derivation derived-key length'));
                    return;
                }

                if (progressCallback) { progressCallback(0); }
                scrypt(passwordBytes, salt, N, r, p, 64, function(error, progress, key) {
                    if (error) {
                        error.progress = progress;
                        reject(error);

                    } else if (key) {
                        key = arrayify(key);

                        var signingKey = getSigningKey(key, reject);
                        if (!signingKey) { return; }

                        if (progressCallback) { progressCallback(1); }
                        resolve(signingKey);

                    } else if (progressCallback) {
                        return progressCallback(progress);
                    }
                });

            } else if (kdf.toLowerCase() === 'pbkdf2') {
                var salt = looseArrayify(searchPath(data, 'crypto/kdfparams/salt'));

                var prfFunc = null;
                var prf = searchPath(data, 'crypto/kdfparams/prf');
                if (prf === 'hmac-sha256') {
                    prfFunc = 'sha256';
                } else if (prf === 'hmac-sha512') {
                    prfFunc = 'sha512';
                } else {
                    reject(new Error('unsupported prf'));
                    return;
                }

                var c = parseInt(searchPath(data, 'crypto/kdfparams/c'));

                var dkLen = parseInt(searchPath(data, 'crypto/kdfparams/dklen'));
                if (dkLen !== 32) {
                    reject( new Error('unsupported key-derivation derived-key length'));
                    return;
                }

                var key = pbkdf2(passwordBytes, salt, c, dkLen, prfFunc);

                var signingKey = getSigningKey(key, reject);
                if (!signingKey) { return; }

                resolve(signingKey);

            } else {
                reject(new Error('unsupported key-derivation function'));
            }

        } else {
            reject(new Error('unsupported key-derivation function'));
        }
    });
}

export function encrypt(privateKey: Arrayish | SigningKey, password: Arrayish | string, options?: EncryptOptions, progressCallback?: ProgressCallback): Promise<string> {

    // the options are optional, so adjust the call as needed
    if (typeof(options) === 'function' && !progressCallback) {
        progressCallback = options;
        options = {};
    }
    if (!options) { options = {}; }

    // Check the private key
    let privateKeyBytes: Uint8Array = null;
    if (SigningKey.isSigningKey(privateKey)) {
        privateKeyBytes = arrayify(privateKey.privateKey);
    } else {
        privateKeyBytes = arrayify(privateKey);
    }
    if (privateKeyBytes.length !== 32) { throw new Error('invalid private key'); }

    let passwordBytes = getPassword(password);

    let entropy: Uint8Array = null

    if (options.entropy) {
        entropy = arrayify(options.entropy);
    }

    if (options.mnemonic) {
        if (entropy) {
            if (HDNode.entropyToMnemonic(entropy) !== options.mnemonic) {
                throw new Error('entropy and mnemonic mismatch');
            }
        } else {
            entropy = arrayify(HDNode.mnemonicToEntropy(options.mnemonic));
        }
    }

    var path: string = options.path;
    if (entropy && !path) {
        path = HDNode.defaultPath;
    }

    var client = options.client;
    if (!client) { client = "ethers.js"; }

    // Check/generate the salt
    let salt: Uint8Array = null;
    if (options.salt) {
        salt = arrayify(options.salt);
    } else {
        salt = randomBytes(32);;
    }

    // Override initialization vector
    let iv: Uint8Array = null;
    if (options.iv) {
        iv = arrayify(options.iv);
        if (iv.length !== 16) { throw new Error('invalid iv'); }
    } else {
       iv = randomBytes(16);
    }

    // Override the uuid
    var uuidRandom: Uint8Array = null;
    if (options.uuid) {
        uuidRandom = arrayify(options.uuid);
        if (uuidRandom.length !== 16) { throw new Error('invalid uuid'); }
    } else {
        uuidRandom = randomBytes(16);
    }

    // Override the scrypt password-based key derivation function parameters
    var N = (1 << 17), r = 8, p = 1;
    if (options.scrypt) {
        if (options.scrypt.N) { N = options.scrypt.N; }
        if (options.scrypt.r) { r = options.scrypt.r; }
        if (options.scrypt.p) { p = options.scrypt.p; }
    }

    return new Promise(function(resolve, reject) {
        if (progressCallback) { progressCallback(0); }

        // We take 64 bytes:
        //   - 32 bytes   As normal for the Web3 secret storage (derivedKey, macPrefix)
        //   - 32 bytes   AES key to encrypt mnemonic with (required here to be Ethers Wallet)
        scrypt(passwordBytes, salt, N, r, p, 64, function(error, progress, key) {
            if (error) {
                error.progress = progress;
                reject(error);

            } else if (key) {
                key = arrayify(key);

                // This will be used to encrypt the wallet (as per Web3 secret storage)
                var derivedKey = key.slice(0, 16);
                var macPrefix = key.slice(16, 32);

                // This will be used to encrypt the mnemonic phrase (if any)
                var mnemonicKey = key.slice(32, 64);

                // Get the address for this private key
                var address = (new SigningKey(privateKeyBytes)).address;

                // Encrypt the private key
                var counter = new aes.Counter(iv);
                var aesCtr = new aes.ModeOfOperation.ctr(derivedKey, counter);
                var ciphertext = arrayify(aesCtr.encrypt(privateKeyBytes));

                // Compute the message authentication code, used to check the password
                var mac = keccak256(concat([macPrefix, ciphertext]))

                // See: https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition
                var data: { [key: string]: any } = {
                    address: address.substring(2).toLowerCase(),
                    id: uuid.v4({ random: uuidRandom }),
                    version: 3,
                    Crypto: {
                        cipher: 'aes-128-ctr',
                        cipherparams: {
                            iv: hexlify(iv).substring(2),
                        },
                        ciphertext: hexlify(ciphertext).substring(2),
                        kdf: 'scrypt',
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
                    var mnemonicIv = randomBytes(16);
                    var mnemonicCounter = new aes.Counter(mnemonicIv);
                    var mnemonicAesCtr = new aes.ModeOfOperation.ctr(mnemonicKey, mnemonicCounter);
                    var mnemonicCiphertext = arrayify(mnemonicAesCtr.encrypt(entropy));
                    var now = new Date();
                    var timestamp = (now.getUTCFullYear() + '-' +
                                     zpad(now.getUTCMonth() + 1, 2) + '-' +
                                     zpad(now.getUTCDate(), 2) + 'T' +
                                     zpad(now.getUTCHours(), 2) + '-' +
                                     zpad(now.getUTCMinutes(), 2) + '-' +
                                     zpad(now.getUTCSeconds(), 2) + '.0Z'
                                    );
                    data['x-ethers'] = {
                        client: client,
                        gethFilename: ('UTC--' + timestamp + '--' + data.address),
                        mnemonicCounter: hexlify(mnemonicIv).substring(2),
                        mnemonicCiphertext: hexlify(mnemonicCiphertext).substring(2),
                        path: path,
                        version: "0.1"
                    };
                }

                if (progressCallback) { progressCallback(1); }
                resolve(JSON.stringify(data));

            } else if (progressCallback) {
                return progressCallback(progress);
            }
        });
    });
}

