'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var uuid_1 = __importDefault(require("uuid"));
var signing_key_1 = require("./signing-key");
var HDNode = __importStar(require("./hdnode"));
var libraries_1 = __importDefault(require("../libraries"));
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
    return __awaiter(this, void 0, void 0, function () {
        var data, ethaddr, encseed, key, iv, encryptedSeed, aesCbc, seed, seedHex, i, seedHexBytes, signingKey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = JSON.parse(json);
                    password = getPassword(password);
                    ethaddr = address_1.getAddress(searchPath(data, 'ethaddr'));
                    encseed = looseArrayify(searchPath(data, 'encseed'));
                    if (!encseed || (encseed.length % 16) !== 0) {
                        throw new Error('invalid encseed');
                    }
                    return [4 /*yield*/, pbkdf2_1.pbkdf2(password, password, 2000, 32, 'sha256')];
                case 1:
                    key = (_a.sent()).slice(0, 16);
                    iv = encseed.slice(0, 16);
                    encryptedSeed = encseed.slice(16);
                    aesCbc = new aes_js_1.default.ModeOfOperation.cbc(key, iv);
                    seed = bytes_1.arrayify(aesCbc.decrypt(encryptedSeed));
                    seed = aes_js_1.default.padding.pkcs7.strip(seed);
                    seedHex = '';
                    for (i = 0; i < seed.length; i++) {
                        seedHex += String.fromCharCode(seed[i]);
                    }
                    seedHexBytes = utf8_1.toUtf8Bytes(seedHex);
                    signingKey = new signing_key_1.SigningKey(keccak256_1.keccak256(seedHexBytes));
                    if (signingKey.address !== ethaddr) {
                        throw new Error('corrupt crowdsale wallet');
                    }
                    return [2 /*return*/, signingKey];
            }
        });
    });
}
exports.decryptCrowdsale = decryptCrowdsale;
//@TODO: string or arrayish
function decrypt(json, password, progressCallback) {
    return __awaiter(this, void 0, void 0, function () {
        var data, passwordBytes, decrypt, computeMAC, getSigningKey;
        return __generator(this, function (_a) {
            data = JSON.parse(json);
            passwordBytes = getPassword(password);
            decrypt = function (key, ciphertext) {
                var cipher = searchPath(data, 'crypto/cipher');
                if (cipher === 'aes-128-ctr') {
                    var iv = looseArrayify(searchPath(data, 'crypto/cipherparams/iv'));
                    var counter = new aes_js_1.default.Counter(iv);
                    var aesCtr = new aes_js_1.default.ModeOfOperation.ctr(key, counter);
                    return bytes_1.arrayify(aesCtr.decrypt(ciphertext));
                }
                return null;
            };
            computeMAC = function (derivedHalf, ciphertext) {
                return keccak256_1.keccak256(bytes_1.concat([derivedHalf, ciphertext]));
            };
            getSigningKey = function (key, reject) {
                return __awaiter(this, void 0, void 0, function () {
                    var ciphertext, computedMAC, privateKey, mnemonicKey, signingKey, mnemonicCiphertext, mnemonicIv, mnemonicCounter, mnemonicAesCtr, path, entropy, mnemonic, node;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ciphertext = looseArrayify(searchPath(data, 'crypto/ciphertext'));
                                computedMAC = bytes_1.hexlify(computeMAC(key.slice(16, 32), ciphertext)).substring(2);
                                if (computedMAC !== searchPath(data, 'crypto/mac').toLowerCase()) {
                                    reject(new Error('invalid password'));
                                    return [2 /*return*/, null];
                                }
                                privateKey = decrypt(key.slice(0, 16), ciphertext);
                                mnemonicKey = key.slice(32, 64);
                                if (!privateKey) {
                                    reject(new Error('unsupported cipher'));
                                    return [2 /*return*/, null];
                                }
                                signingKey = new signing_key_1.SigningKey(privateKey);
                                if (signingKey.address !== address_1.getAddress(data.address)) {
                                    reject(new Error('address mismatch'));
                                    return [2 /*return*/, null];
                                }
                                if (!(searchPath(data, 'x-ethers/version') === '0.1')) return [3 /*break*/, 2];
                                mnemonicCiphertext = looseArrayify(searchPath(data, 'x-ethers/mnemonicCiphertext'));
                                mnemonicIv = looseArrayify(searchPath(data, 'x-ethers/mnemonicCounter'));
                                mnemonicCounter = new aes_js_1.default.Counter(mnemonicIv);
                                mnemonicAesCtr = new aes_js_1.default.ModeOfOperation.ctr(mnemonicKey, mnemonicCounter);
                                path = searchPath(data, 'x-ethers/path') || HDNode.defaultPath;
                                entropy = bytes_1.arrayify(mnemonicAesCtr.decrypt(mnemonicCiphertext));
                                mnemonic = HDNode.entropyToMnemonic(entropy);
                                return [4 /*yield*/, HDNode.fromMnemonic(mnemonic)];
                            case 1:
                                node = (_a.sent()).derivePath(path);
                                if (node.privateKey != bytes_1.hexlify(privateKey)) {
                                    reject(new Error('mnemonic mismatch'));
                                    return [2 /*return*/, null];
                                }
                                signingKey = new signing_key_1.SigningKey(node);
                                _a.label = 2;
                            case 2: return [2 /*return*/, signingKey];
                        }
                    });
                });
            };
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    return __awaiter(this, void 0, void 0, function () {
                        var kdf, salt, N, r, p, dkLen, scrypt, salt, prfFunc, prf, c, dkLen, key, signingKey;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    kdf = searchPath(data, 'crypto/kdf');
                                    if (!(kdf && typeof (kdf) === 'string')) return [3 /*break*/, 6];
                                    if (!(kdf.toLowerCase() === 'scrypt')) return [3 /*break*/, 1];
                                    salt = looseArrayify(searchPath(data, 'crypto/kdfparams/salt'));
                                    N = parseInt(searchPath(data, 'crypto/kdfparams/n'));
                                    r = parseInt(searchPath(data, 'crypto/kdfparams/r'));
                                    p = parseInt(searchPath(data, 'crypto/kdfparams/p'));
                                    if (!N || !r || !p) {
                                        reject(new Error('unsupported key-derivation function parameters'));
                                        return [2 /*return*/];
                                    }
                                    // Make sure N is a power of 2
                                    if ((N & (N - 1)) !== 0) {
                                        reject(new Error('unsupported key-derivation function parameter value for N'));
                                        return [2 /*return*/];
                                    }
                                    dkLen = parseInt(searchPath(data, 'crypto/kdfparams/dklen'));
                                    if (dkLen !== 32) {
                                        reject(new Error('unsupported key-derivation derived-key length'));
                                        return [2 /*return*/];
                                    }
                                    if (progressCallback) {
                                        progressCallback(0);
                                    }
                                    scrypt = libraries_1.default.scrypt;
                                    scrypt(passwordBytes, salt, N, r, p, 64, function (error, progress, key) {
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
                                    return [3 /*break*/, 5];
                                case 1:
                                    if (!(kdf.toLowerCase() === 'pbkdf2')) return [3 /*break*/, 4];
                                    salt = looseArrayify(searchPath(data, 'crypto/kdfparams/salt'));
                                    prfFunc = null;
                                    prf = searchPath(data, 'crypto/kdfparams/prf');
                                    if (prf === 'hmac-sha256') {
                                        prfFunc = 'sha256';
                                    }
                                    else if (prf === 'hmac-sha512') {
                                        prfFunc = 'sha512';
                                    }
                                    else {
                                        reject(new Error('unsupported prf'));
                                        return [2 /*return*/];
                                    }
                                    c = parseInt(searchPath(data, 'crypto/kdfparams/c'));
                                    dkLen = parseInt(searchPath(data, 'crypto/kdfparams/dklen'));
                                    if (dkLen !== 32) {
                                        reject(new Error('unsupported key-derivation derived-key length'));
                                        return [2 /*return*/];
                                    }
                                    return [4 /*yield*/, pbkdf2_1.pbkdf2(passwordBytes, salt, c, dkLen, prfFunc)];
                                case 2:
                                    key = _a.sent();
                                    return [4 /*yield*/, getSigningKey(key, reject)];
                                case 3:
                                    signingKey = _a.sent();
                                    if (!signingKey) {
                                        return [2 /*return*/];
                                    }
                                    resolve(signingKey);
                                    return [3 /*break*/, 5];
                                case 4:
                                    reject(new Error('unsupported key-derivation function'));
                                    _a.label = 5;
                                case 5: return [3 /*break*/, 7];
                                case 6:
                                    reject(new Error('unsupported key-derivation function'));
                                    _a.label = 7;
                                case 7: return [2 /*return*/];
                            }
                        });
                    });
                })];
        });
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
            entropy = bytes_1.arrayify(HDNode.mnemonicToEntropy(options.mnemonic));
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
        libraries_1.default.scrypt(passwordBytes, salt, N, r, p, 64, function (error, progress, key) {
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
