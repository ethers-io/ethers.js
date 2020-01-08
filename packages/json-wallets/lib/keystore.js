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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var scrypt = __importStar(require("scrypt-js"));
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
    return __awaiter(this, void 0, void 0, function () {
        var data, passwordBytes, decrypt, computeMAC, getAccount, kdf, salt, N, r, p, dkLen, key, salt, prfFunc, prf, c, dkLen, key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = JSON.parse(json);
                    passwordBytes = utils_1.getPassword(password);
                    decrypt = function (key, ciphertext) {
                        var cipher = utils_1.searchPath(data, "crypto/cipher");
                        if (cipher === "aes-128-ctr") {
                            var iv = utils_1.looseArrayify(utils_1.searchPath(data, "crypto/cipherparams/iv"));
                            var counter = new aes_js_1.default.Counter(iv);
                            var aesCtr = new aes_js_1.default.ModeOfOperation.ctr(key, counter);
                            return bytes_1.arrayify(aesCtr.decrypt(ciphertext));
                        }
                        return null;
                    };
                    computeMAC = function (derivedHalf, ciphertext) {
                        return keccak256_1.keccak256(bytes_1.concat([derivedHalf, ciphertext]));
                    };
                    getAccount = function (key) {
                        return __awaiter(this, void 0, void 0, function () {
                            var ciphertext, computedMAC, privateKey, mnemonicKey, address, check, account, mnemonicCiphertext, mnemonicIv, mnemonicCounter, mnemonicAesCtr, path, entropy, mnemonic, node;
                            return __generator(this, function (_a) {
                                ciphertext = utils_1.looseArrayify(utils_1.searchPath(data, "crypto/ciphertext"));
                                computedMAC = bytes_1.hexlify(computeMAC(key.slice(16, 32), ciphertext)).substring(2);
                                if (computedMAC !== utils_1.searchPath(data, "crypto/mac").toLowerCase()) {
                                    throw new Error("invalid password");
                                }
                                privateKey = decrypt(key.slice(0, 16), ciphertext);
                                mnemonicKey = key.slice(32, 64);
                                if (!privateKey) {
                                    throw new Error("unsupported cipher");
                                }
                                address = transactions_1.computeAddress(privateKey);
                                if (data.address) {
                                    check = data.address.toLowerCase();
                                    if (check.substring(0, 2) !== "0x") {
                                        check = "0x" + check;
                                    }
                                    if (address_1.getAddress(check) !== address) {
                                        throw new Error("address mismatch");
                                    }
                                }
                                account = {
                                    _isKeystoreAccount: true,
                                    address: address,
                                    privateKey: bytes_1.hexlify(privateKey)
                                };
                                // Version 0.1 x-ethers metadata must contain an encrypted mnemonic phrase
                                if (utils_1.searchPath(data, "x-ethers/version") === "0.1") {
                                    mnemonicCiphertext = utils_1.looseArrayify(utils_1.searchPath(data, "x-ethers/mnemonicCiphertext"));
                                    mnemonicIv = utils_1.looseArrayify(utils_1.searchPath(data, "x-ethers/mnemonicCounter"));
                                    mnemonicCounter = new aes_js_1.default.Counter(mnemonicIv);
                                    mnemonicAesCtr = new aes_js_1.default.ModeOfOperation.ctr(mnemonicKey, mnemonicCounter);
                                    path = utils_1.searchPath(data, "x-ethers/path") || hdnode_1.defaultPath;
                                    entropy = bytes_1.arrayify(mnemonicAesCtr.decrypt(mnemonicCiphertext));
                                    mnemonic = hdnode_1.entropyToMnemonic(entropy);
                                    node = hdnode_1.HDNode.fromMnemonic(mnemonic).derivePath(path);
                                    if (node.privateKey != account.privateKey) {
                                        throw new Error("mnemonic mismatch");
                                    }
                                    account.mnemonic = node.mnemonic;
                                    account.path = node.path;
                                }
                                return [2 /*return*/, new KeystoreAccount(account)];
                            });
                        });
                    };
                    kdf = utils_1.searchPath(data, "crypto/kdf");
                    if (!(kdf && typeof (kdf) === "string")) return [3 /*break*/, 3];
                    if (!(kdf.toLowerCase() === "scrypt")) return [3 /*break*/, 2];
                    salt = utils_1.looseArrayify(utils_1.searchPath(data, "crypto/kdfparams/salt"));
                    N = parseInt(utils_1.searchPath(data, "crypto/kdfparams/n"));
                    r = parseInt(utils_1.searchPath(data, "crypto/kdfparams/r"));
                    p = parseInt(utils_1.searchPath(data, "crypto/kdfparams/p"));
                    if (!N || !r || !p) {
                        throw new Error("unsupported key-derivation function parameters");
                    }
                    // Make sure N is a power of 2
                    if ((N & (N - 1)) !== 0) {
                        throw new Error("unsupported key-derivation function parameter value for N");
                    }
                    dkLen = parseInt(utils_1.searchPath(data, "crypto/kdfparams/dklen"));
                    if (dkLen !== 32) {
                        throw new Error("unsupported key-derivation derived-key length");
                    }
                    return [4 /*yield*/, scrypt.scrypt(passwordBytes, salt, N, r, p, 64, progressCallback)];
                case 1:
                    key = _a.sent();
                    //key = arrayify(key);
                    return [2 /*return*/, getAccount(key)];
                case 2:
                    if (kdf.toLowerCase() === "pbkdf2") {
                        salt = utils_1.looseArrayify(utils_1.searchPath(data, "crypto/kdfparams/salt"));
                        prfFunc = null;
                        prf = utils_1.searchPath(data, "crypto/kdfparams/prf");
                        if (prf === "hmac-sha256") {
                            prfFunc = "sha256";
                        }
                        else if (prf === "hmac-sha512") {
                            prfFunc = "sha512";
                        }
                        else {
                            throw new Error("unsupported prf");
                        }
                        c = parseInt(utils_1.searchPath(data, "crypto/kdfparams/c"));
                        dkLen = parseInt(utils_1.searchPath(data, "crypto/kdfparams/dklen"));
                        if (dkLen !== 32) {
                            throw new Error("unsupported key-derivation derived-key length");
                        }
                        key = bytes_1.arrayify(pbkdf2_1.pbkdf2(passwordBytes, salt, c, dkLen, prfFunc));
                        return [2 /*return*/, getAccount(key)];
                    }
                    _a.label = 3;
                case 3: throw new Error("unsupported key-derivation function");
            }
        });
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
    // We take 64 bytes:
    //   - 32 bytes   As normal for the Web3 secret storage (derivedKey, macPrefix)
    //   - 32 bytes   AES key to encrypt mnemonic with (required here to be Ethers Wallet)
    return scrypt.scrypt(passwordBytes, salt, N, r, p, 64, progressCallback).then(function (key) {
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
        return JSON.stringify(data);
    });
}
exports.encrypt = encrypt;
