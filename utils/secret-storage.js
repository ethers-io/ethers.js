'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var aes_js_1 = __importDefault(require("aes-js"));
var scrypt_js_1 = __importDefault(require("scrypt-js"));
var uuid_1 = __importDefault(require("uuid"));
var signing_key_1 = require("./signing-key");
var HDNode = __importStar(require("./hdnode"));
var address_1 = require("./address");
var bytes_1 = require("./bytes");
var pbkdf2_1 = require("./pbkdf2");
var keccak256_1 = require("./keccak256");
var utf8_1 = require("./utf8");
var random_bytes_1 = require("./random-bytes");
function looseArrayify(hexString) {
    if (typeof (hexString) === 'string' && hexString.substring(0, 2) !== '0x') {
        hexString = '0x' + hexString;
    }
    return bytes_1.arrayify(hexString);
}
function zpad(value, length) {
    value = String(value);
    while (value.length < length) {
        value = '0' + value;
    }
    return value;
}
function getPassword(password) {
    if (typeof (password) === 'string') {
        return utf8_1.toUtf8Bytes(password, utf8_1.UnicodeNormalizationForm.NFKC);
    }
    return bytes_1.arrayify(password);
}
// Search an Object and its children recursively, caselessly.
function searchPath(object, path) {
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
function decryptCrowdsale(json, password) {
    var data = JSON.parse(json);
    password = getPassword(password);
    // Ethereum Address
    var ethaddr = address_1.getAddress(searchPath(data, 'ethaddr'));
    // Encrypted Seed
    var encseed = looseArrayify(searchPath(data, 'encseed'));
    if (!encseed || (encseed.length % 16) !== 0) {
        throw new Error('invalid encseed');
    }
    var key = pbkdf2_1.pbkdf2(password, password, 2000, 32, 'sha256').slice(0, 16);
    var iv = encseed.slice(0, 16);
    var encryptedSeed = encseed.slice(16);
    // Decrypt the seed
    var aesCbc = new aes_js_1.default.ModeOfOperation.cbc(key, iv);
    var seed = bytes_1.arrayify(aesCbc.decrypt(encryptedSeed));
    seed = aes_js_1.default.padding.pkcs7.strip(seed);
    // This wallet format is weird... Convert the binary encoded hex to a string.
    var seedHex = '';
    for (var i = 0; i < seed.length; i++) {
        seedHex += String.fromCharCode(seed[i]);
    }
    var seedHexBytes = utf8_1.toUtf8Bytes(seedHex);
    var signingKey = new signing_key_1.SigningKey(keccak256_1.keccak256(seedHexBytes));
    if (signingKey.address !== ethaddr) {
        throw new Error('corrupt crowdsale wallet');
    }
    return signingKey;
}
exports.decryptCrowdsale = decryptCrowdsale;
//@TODO: string or arrayish
function decrypt(json, password, progressCallback) {
    var data = JSON.parse(json);
    var passwordBytes = getPassword(password);
    var decrypt = function (key, ciphertext) {
        var cipher = searchPath(data, 'crypto/cipher');
        if (cipher === 'aes-128-ctr') {
            var iv = looseArrayify(searchPath(data, 'crypto/cipherparams/iv'));
            var counter = new aes_js_1.default.Counter(iv);
            var aesCtr = new aes_js_1.default.ModeOfOperation.ctr(key, counter);
            return bytes_1.arrayify(aesCtr.decrypt(ciphertext));
        }
        return null;
    };
    var computeMAC = function (derivedHalf, ciphertext) {
        return keccak256_1.keccak256(bytes_1.concat([derivedHalf, ciphertext]));
    };
    var getSigningKey = function (key, reject) {
        var ciphertext = looseArrayify(searchPath(data, 'crypto/ciphertext'));
        var computedMAC = bytes_1.hexlify(computeMAC(key.slice(16, 32), ciphertext)).substring(2);
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
        var signingKey = new signing_key_1.SigningKey(privateKey);
        if (data.address && signingKey.address !== address_1.getAddress(data.address)) {
            reject(new Error('address mismatch'));
            return null;
        }
        // Version 0.1 x-ethers metadata must contain an encrypted mnemonic phrase
        var locale = searchPath(data, 'x-ethers/locale');
        if (searchPath(data, 'x-ethers/version') === '0.1' && (locale == null || locale === "en")) {
            var mnemonicCiphertext = looseArrayify(searchPath(data, 'x-ethers/mnemonicCiphertext'));
            var mnemonicIv = looseArrayify(searchPath(data, 'x-ethers/mnemonicCounter'));
            var mnemonicCounter = new aes_js_1.default.Counter(mnemonicIv);
            var mnemonicAesCtr = new aes_js_1.default.ModeOfOperation.ctr(mnemonicKey, mnemonicCounter);
            var path = searchPath(data, 'x-ethers/path') || HDNode.defaultPath;
            var entropy = bytes_1.arrayify(mnemonicAesCtr.decrypt(mnemonicCiphertext));
            var mnemonic = HDNode.entropyToMnemonic(entropy);
            var node = HDNode.fromMnemonic(mnemonic).derivePath(path);
            if (node.privateKey != bytes_1.hexlify(privateKey)) {
                reject(new Error('mnemonic mismatch'));
                return null;
            }
            signingKey = new signing_key_1.SigningKey(node);
        }
        return signingKey;
    };
    return new Promise(function (resolve, reject) {
        var kdf = searchPath(data, 'crypto/kdf');
        if (kdf && typeof (kdf) === 'string') {
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
                    reject(new Error('unsupported key-derivation derived-key length'));
                    return;
                }
                if (progressCallback) {
                    progressCallback(0);
                }
                scrypt_js_1.default(passwordBytes, salt, N, r, p, 64, function (error, progress, key) {
                    if (error) {
                        error.progress = progress;
                        reject(error);
                    }
                    else if (key) {
                        key = bytes_1.arrayify(key);
                        var signingKey = getSigningKey(key, reject);
                        if (!signingKey) {
                            return;
                        }
                        if (progressCallback) {
                            progressCallback(1);
                        }
                        resolve(signingKey);
                    }
                    else if (progressCallback) {
                        return progressCallback(progress);
                    }
                });
            }
            else if (kdf.toLowerCase() === 'pbkdf2') {
                var salt = looseArrayify(searchPath(data, 'crypto/kdfparams/salt'));
                var prfFunc = null;
                var prf = searchPath(data, 'crypto/kdfparams/prf');
                if (prf === 'hmac-sha256') {
                    prfFunc = 'sha256';
                }
                else if (prf === 'hmac-sha512') {
                    prfFunc = 'sha512';
                }
                else {
                    reject(new Error('unsupported prf'));
                    return;
                }
                var c = parseInt(searchPath(data, 'crypto/kdfparams/c'));
                var dkLen = parseInt(searchPath(data, 'crypto/kdfparams/dklen'));
                if (dkLen !== 32) {
                    reject(new Error('unsupported key-derivation derived-key length'));
                    return;
                }
                var key = pbkdf2_1.pbkdf2(passwordBytes, salt, c, dkLen, prfFunc);
                var signingKey = getSigningKey(key, reject);
                if (!signingKey) {
                    return;
                }
                resolve(signingKey);
            }
            else {
                reject(new Error('unsupported key-derivation function'));
            }
        }
        else {
            reject(new Error('unsupported key-derivation function'));
        }
    });
}
exports.decrypt = decrypt;
function encrypt(privateKey, password, options, progressCallback) {
    // the options are optional, so adjust the call as needed
    if (typeof (options) === 'function' && !progressCallback) {
        progressCallback = options;
        options = {};
    }
    if (!options) {
        options = {};
    }
    // Check the private key
    var privateKeyBytes = null;
    if (signing_key_1.SigningKey.isSigningKey(privateKey)) {
        privateKeyBytes = bytes_1.arrayify(privateKey.privateKey);
    }
    else {
        privateKeyBytes = bytes_1.arrayify(privateKey);
    }
    if (privateKeyBytes.length !== 32) {
        throw new Error('invalid private key');
    }
    var passwordBytes = getPassword(password);
    var entropy = null;
    if (options.entropy) {
        entropy = bytes_1.arrayify(options.entropy);
    }
    if (options.mnemonic) {
        if (entropy) {
            if (HDNode.entropyToMnemonic(entropy) !== options.mnemonic) {
                throw new Error('entropy and mnemonic mismatch');
            }
        }
        else {
            entropy = bytes_1.arrayify(HDNode.mnemonicToEntropy(options.mnemonic, options.wordlist));
        }
    }
    var path = options.path;
    if (entropy && !path) {
        path = HDNode.defaultPath;
    }
    var client = options.client;
    if (!client) {
        client = "ethers.js";
    }
    // Check/generate the salt
    var salt = null;
    if (options.salt) {
        salt = bytes_1.arrayify(options.salt);
    }
    else {
        salt = random_bytes_1.randomBytes(32);
        ;
    }
    // Override initialization vector
    var iv = null;
    if (options.iv) {
        iv = bytes_1.arrayify(options.iv);
        if (iv.length !== 16) {
            throw new Error('invalid iv');
        }
    }
    else {
        iv = random_bytes_1.randomBytes(16);
    }
    // Override the uuid
    var uuidRandom = null;
    if (options.uuid) {
        uuidRandom = bytes_1.arrayify(options.uuid);
        if (uuidRandom.length !== 16) {
            throw new Error('invalid uuid');
        }
    }
    else {
        uuidRandom = random_bytes_1.randomBytes(16);
    }
    // Override the scrypt password-based key derivation function parameters
    var N = (1 << 17), r = 8, p = 1;
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
        scrypt_js_1.default(passwordBytes, salt, N, r, p, 64, function (error, progress, key) {
            if (error) {
                error.progress = progress;
                reject(error);
            }
            else if (key) {
                key = bytes_1.arrayify(key);
                // This will be used to encrypt the wallet (as per Web3 secret storage)
                var derivedKey = key.slice(0, 16);
                var macPrefix = key.slice(16, 32);
                // This will be used to encrypt the mnemonic phrase (if any)
                var mnemonicKey = key.slice(32, 64);
                // Get the address for this private key
                var address = (new signing_key_1.SigningKey(privateKeyBytes)).address;
                // Encrypt the private key
                var counter = new aes_js_1.default.Counter(iv);
                var aesCtr = new aes_js_1.default.ModeOfOperation.ctr(derivedKey, counter);
                var ciphertext = bytes_1.arrayify(aesCtr.encrypt(privateKeyBytes));
                // Compute the message authentication code, used to check the password
                var mac = keccak256_1.keccak256(bytes_1.concat([macPrefix, ciphertext]));
                // See: https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition
                var data = {
                    address: address.substring(2).toLowerCase(),
                    id: uuid_1.default.v4({ random: uuidRandom }),
                    version: 3,
                    Crypto: {
                        cipher: 'aes-128-ctr',
                        cipherparams: {
                            iv: bytes_1.hexlify(iv).substring(2),
                        },
                        ciphertext: bytes_1.hexlify(ciphertext).substring(2),
                        kdf: 'scrypt',
                        kdfparams: {
                            salt: bytes_1.hexlify(salt).substring(2),
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
                    var mnemonicIv = random_bytes_1.randomBytes(16);
                    var mnemonicCounter = new aes_js_1.default.Counter(mnemonicIv);
                    var mnemonicAesCtr = new aes_js_1.default.ModeOfOperation.ctr(mnemonicKey, mnemonicCounter);
                    var mnemonicCiphertext = bytes_1.arrayify(mnemonicAesCtr.encrypt(entropy));
                    var now = new Date();
                    var timestamp = (now.getUTCFullYear() + '-' +
                        zpad(now.getUTCMonth() + 1, 2) + '-' +
                        zpad(now.getUTCDate(), 2) + 'T' +
                        zpad(now.getUTCHours(), 2) + '-' +
                        zpad(now.getUTCMinutes(), 2) + '-' +
                        zpad(now.getUTCSeconds(), 2) + '.0Z');
                    data['x-ethers'] = {
                        client: client,
                        gethFilename: ('UTC--' + timestamp + '--' + data.address),
                        mnemonicCounter: bytes_1.hexlify(mnemonicIv).substring(2),
                        mnemonicCiphertext: bytes_1.hexlify(mnemonicCiphertext).substring(2),
                        path: path,
                        version: "0.1"
                    };
                    if (options.wordlist && typeof (options.wordlist.locale) === "string") {
                        data['x-ethers'].locale = options.wordlist.locale;
                    }
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
exports.encrypt = encrypt;
