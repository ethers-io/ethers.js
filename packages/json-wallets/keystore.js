"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var aes_js_1 = __importDefault(require("aes-js"));
var scrypt_js_1 = __importDefault(require("scrypt-js"));
var uuid_1 = __importDefault(require("uuid"));
var address_1 = require("@ethersproject/address");
var bytes_1 = require("@ethersproject/bytes");
var hdnode_1 = require("@ethersproject/hdnode");
var keccak256_1 = require("@ethersproject/keccak256");
var pbkdf2_1 = require("@ethersproject/pbkdf2");
var random_1 = require("@ethersproject/random");
var properties_1 = require("@ethersproject/properties");
var transactions_1 = require("@ethersproject/transactions");
var utils_1 = require("./utils");
// Exported Types
var KeystoreAccount = /** @class */ (function (_super) {
    __extends(KeystoreAccount, _super);
    function KeystoreAccount() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    KeystoreAccount.prototype.isKeystoreAccount = function (value) {
        return !!(value && value._isKeystoreAccount);
    };
    return KeystoreAccount;
}(properties_1.Description));
exports.KeystoreAccount = KeystoreAccount;
function decrypt(json, password, progressCallback) {
    var data = JSON.parse(json);
    var passwordBytes = utils_1.getPassword(password);
    var decrypt = function (key, ciphertext) {
        var cipher = utils_1.searchPath(data, "crypto/cipher");
        if (cipher === "aes-128-ctr") {
            var iv = utils_1.looseArrayify(utils_1.searchPath(data, "crypto/cipherparams/iv"));
            var counter = new aes_js_1.default.Counter(iv);
            var aesCtr = new aes_js_1.default.ModeOfOperation.ctr(key, counter);
            return bytes_1.arrayify(aesCtr.decrypt(ciphertext));
        }
        return null;
    };
    var computeMAC = function (derivedHalf, ciphertext) {
        return keccak256_1.keccak256(bytes_1.concat([derivedHalf, ciphertext]));
    };
    var getAccount = function (key, reject) {
        var ciphertext = utils_1.looseArrayify(utils_1.searchPath(data, "crypto/ciphertext"));
        var computedMAC = bytes_1.hexlify(computeMAC(key.slice(16, 32), ciphertext)).substring(2);
        if (computedMAC !== utils_1.searchPath(data, "crypto/mac").toLowerCase()) {
            reject(new Error("invalid password"));
            return null;
        }
        var privateKey = decrypt(key.slice(0, 16), ciphertext);
        var mnemonicKey = key.slice(32, 64);
        if (!privateKey) {
            reject(new Error("unsupported cipher"));
            return null;
        }
        var address = data.address.toLowerCase();
        if (address.substring(0, 2) !== "0x") {
            address = "0x" + address;
        }
        try {
            if (address_1.getAddress(address) !== transactions_1.computeAddress(privateKey)) {
                reject(new Error("address mismatch"));
                return null;
            }
        }
        catch (e) { }
        var account = {
            _isKeystoreAccount: true,
            address: address,
            privateKey: bytes_1.hexlify(privateKey)
        };
        // Version 0.1 x-ethers metadata must contain an encrypted mnemonic phrase
        if (utils_1.searchPath(data, "x-ethers/version") === "0.1") {
            var mnemonicCiphertext = utils_1.looseArrayify(utils_1.searchPath(data, "x-ethers/mnemonicCiphertext"));
            var mnemonicIv = utils_1.looseArrayify(utils_1.searchPath(data, "x-ethers/mnemonicCounter"));
            var mnemonicCounter = new aes_js_1.default.Counter(mnemonicIv);
            var mnemonicAesCtr = new aes_js_1.default.ModeOfOperation.ctr(mnemonicKey, mnemonicCounter);
            var path = utils_1.searchPath(data, "x-ethers/path") || hdnode_1.defaultPath;
            var entropy = bytes_1.arrayify(mnemonicAesCtr.decrypt(mnemonicCiphertext));
            var mnemonic = hdnode_1.entropyToMnemonic(entropy);
            var node = hdnode_1.HDNode.fromMnemonic(mnemonic).derivePath(path);
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
        var kdf = utils_1.searchPath(data, "crypto/kdf");
        if (kdf && typeof (kdf) === "string") {
            if (kdf.toLowerCase() === "scrypt") {
                var salt = utils_1.looseArrayify(utils_1.searchPath(data, "crypto/kdfparams/salt"));
                var N = parseInt(utils_1.searchPath(data, "crypto/kdfparams/n"));
                var r = parseInt(utils_1.searchPath(data, "crypto/kdfparams/r"));
                var p = parseInt(utils_1.searchPath(data, "crypto/kdfparams/p"));
                if (!N || !r || !p) {
                    reject(new Error("unsupported key-derivation function parameters"));
                    return;
                }
                // Make sure N is a power of 2
                if ((N & (N - 1)) !== 0) {
                    reject(new Error("unsupported key-derivation function parameter value for N"));
                    return;
                }
                var dkLen = parseInt(utils_1.searchPath(data, "crypto/kdfparams/dklen"));
                if (dkLen !== 32) {
                    reject(new Error("unsupported key-derivation derived-key length"));
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
                        var account = getAccount(key, reject);
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
                var salt = utils_1.looseArrayify(utils_1.searchPath(data, "crypto/kdfparams/salt"));
                var prfFunc = null;
                var prf = utils_1.searchPath(data, "crypto/kdfparams/prf");
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
                var c = parseInt(utils_1.searchPath(data, "crypto/kdfparams/c"));
                var dkLen = parseInt(utils_1.searchPath(data, "crypto/kdfparams/dklen"));
                if (dkLen !== 32) {
                    reject(new Error("unsupported key-derivation derived-key length"));
                    return;
                }
                var key = bytes_1.arrayify(pbkdf2_1.pbkdf2(passwordBytes, salt, c, dkLen, prfFunc));
                var account = getAccount(key, reject);
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
exports.decrypt = decrypt;
function encrypt(account, password, options, progressCallback) {
    try {
        if (address_1.getAddress(account.address) !== transactions_1.computeAddress(account.privateKey)) {
            throw new Error("address/privateKey mismatch");
        }
        if (account.mnemonic != null) {
            var node = hdnode_1.HDNode.fromMnemonic(account.mnemonic).derivePath(account.path || hdnode_1.defaultPath);
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
    var privateKey = bytes_1.arrayify(account.privateKey);
    var passwordBytes = utils_1.getPassword(password);
    var entropy = null;
    var path = account.path;
    if (account.mnemonic) {
        entropy = bytes_1.arrayify(hdnode_1.mnemonicToEntropy(account.mnemonic));
        if (!path) {
            path = hdnode_1.defaultPath;
        }
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
        salt = random_1.randomBytes(32);
        ;
    }
    // Override initialization vector
    var iv = null;
    if (options.iv) {
        iv = bytes_1.arrayify(options.iv);
        if (iv.length !== 16) {
            throw new Error("invalid iv");
        }
    }
    else {
        iv = random_1.randomBytes(16);
    }
    // Override the uuid
    var uuidRandom = null;
    if (options.uuid) {
        uuidRandom = bytes_1.arrayify(options.uuid);
        if (uuidRandom.length !== 16) {
            throw new Error("invalid uuid");
        }
    }
    else {
        uuidRandom = random_1.randomBytes(16);
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
                // Encrypt the private key
                var counter = new aes_js_1.default.Counter(iv);
                var aesCtr = new aes_js_1.default.ModeOfOperation.ctr(derivedKey, counter);
                var ciphertext = bytes_1.arrayify(aesCtr.encrypt(privateKey));
                // Compute the message authentication code, used to check the password
                var mac = keccak256_1.keccak256(bytes_1.concat([macPrefix, ciphertext]));
                // See: https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition
                var data = {
                    address: account.address.substring(2).toLowerCase(),
                    id: uuid_1.default.v4({ random: uuidRandom }),
                    version: 3,
                    Crypto: {
                        cipher: "aes-128-ctr",
                        cipherparams: {
                            iv: bytes_1.hexlify(iv).substring(2),
                        },
                        ciphertext: bytes_1.hexlify(ciphertext).substring(2),
                        kdf: "scrypt",
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
                    var mnemonicIv = random_1.randomBytes(16);
                    var mnemonicCounter = new aes_js_1.default.Counter(mnemonicIv);
                    var mnemonicAesCtr = new aes_js_1.default.ModeOfOperation.ctr(mnemonicKey, mnemonicCounter);
                    var mnemonicCiphertext = bytes_1.arrayify(mnemonicAesCtr.encrypt(entropy));
                    var now = new Date();
                    var timestamp = (now.getUTCFullYear() + "-" +
                        utils_1.zpad(now.getUTCMonth() + 1, 2) + "-" +
                        utils_1.zpad(now.getUTCDate(), 2) + "T" +
                        utils_1.zpad(now.getUTCHours(), 2) + "-" +
                        utils_1.zpad(now.getUTCMinutes(), 2) + "-" +
                        utils_1.zpad(now.getUTCSeconds(), 2) + ".0Z");
                    data["x-ethers"] = {
                        client: client,
                        gethFilename: ("UTC--" + timestamp + "--" + data.address),
                        mnemonicCounter: bytes_1.hexlify(mnemonicIv).substring(2),
                        mnemonicCiphertext: bytes_1.hexlify(mnemonicCiphertext).substring(2),
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
exports.encrypt = encrypt;
