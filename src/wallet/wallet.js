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
var scrypt_js_1 = __importDefault(require("scrypt-js"));
var hdnode_1 = require("./hdnode");
var secretStorage = __importStar(require("./secret-storage"));
var signing_key_1 = require("./signing-key");
var convert_1 = require("../utils/convert");
var keccak256_1 = require("../utils/keccak256");
var properties_1 = require("../utils/properties");
var random_bytes_1 = require("../utils/random-bytes");
var transaction_1 = require("../utils/transaction");
var utf8_1 = require("../utils/utf8");
var errors = __importStar(require("../utils/errors"));
// This ensures we inject a setImmediate into the global space, which
// dramatically improves the performance of the scrypt PBKDF.
console.log("Fix this! Setimmediate");
// @TODO: Move to HDNode
var defaultPath = "m/44'/60'/0'/0/0";
var Wallet = /** @class */ (function () {
    function Wallet(privateKey, provider) {
        //private _provider;
        this.defaultGasLimit = 1500000;
        errors.checkNew(this, Wallet);
        // Make sure we have a valid signing key
        if (privateKey instanceof signing_key_1.SigningKey) {
            this.signingKey = privateKey;
            if (this.signingKey.mnemonic) {
                properties_1.defineReadOnly(this, 'mnemonic', privateKey.mnemonic);
                properties_1.defineReadOnly(this, 'path', privateKey.path);
            }
        }
        else {
            this.signingKey = new signing_key_1.SigningKey(privateKey);
        }
        properties_1.defineReadOnly(this, 'privateKey', this.signingKey.privateKey);
        this.provider = provider;
        properties_1.defineReadOnly(this, 'address', this.signingKey.address);
    }
    Wallet.prototype.sign = function (transaction) {
        return transaction_1.sign(transaction, this.signingKey.signDigest.bind(this.signingKey));
    };
    Wallet.prototype.getAddress = function () {
        return Promise.resolve(this.address);
    };
    Wallet.prototype.getBalance = function (blockTag) {
        if (!this.provider) {
            throw new Error('missing provider');
        }
        return this.provider.getBalance(this.address, blockTag);
    };
    Wallet.prototype.getTransactionCount = function (blockTag) {
        if (!this.provider) {
            throw new Error('missing provider');
        }
        return this.provider.getTransactionCount(this.address, blockTag);
    };
    Wallet.prototype.getGasPrice = function () {
        if (!this.provider) {
            throw new Error('missing provider');
        }
        return this.provider.getGasPrice();
    };
    Wallet.prototype.estimateGas = function (transaction) {
        if (!this.provider) {
            throw new Error('missing provider');
        }
        var calculate = {};
        ['from', 'to', 'data', 'value'].forEach(function (key) {
            if (transaction[key] == null) {
                return;
            }
            calculate[key] = transaction[key];
        });
        if (transaction.from == null) {
            calculate.from = this.address;
        }
        return this.provider.estimateGas(calculate);
    };
    Wallet.prototype.sendTransaction = function (transaction) {
        var _this = this;
        if (!this.provider) {
            throw new Error('missing provider');
        }
        if (!transaction || typeof (transaction) !== 'object') {
            throw new Error('invalid transaction object');
        }
        var tx = properties_1.shallowCopy(transaction);
        if (tx.to != null) {
            tx.to = this.provider.resolveName(tx.to);
        }
        if (tx.gasLimit == null) {
            tx.gasLimit = this.estimateGas(tx);
        }
        if (tx.gasPrice == null) {
            tx.gasPrice = this.getGasPrice();
        }
        if (tx.nonce == null) {
            tx.nonce = this.getTransactionCount();
        }
        if (tx.chainId == null) {
            tx.chainId = this.provider.getNetwork().then(function (network) { return network.chainId; });
        }
        return properties_1.resolveProperties(tx).then(function (tx) {
            console.log('To Sign', tx);
            return _this.provider.sendTransaction(_this.sign(tx));
        });
    };
    Wallet.prototype.send = function (addressOrName, amountWei, options) {
        if (!options) {
            options = {};
        }
        return this.sendTransaction({
            to: addressOrName,
            gasLimit: options.gasLimit,
            gasPrice: options.gasPrice,
            nonce: options.nonce,
            value: amountWei,
        });
    };
    Wallet.hashMessage = function (message) {
        var payload = convert_1.concat([
            utf8_1.toUtf8Bytes('\x19Ethereum Signed Message:\n'),
            utf8_1.toUtf8Bytes(String(message.length)),
            ((typeof (message) === 'string') ? utf8_1.toUtf8Bytes(message) : message)
        ]);
        return keccak256_1.keccak256(payload);
    };
    Wallet.prototype.signMessage = function (message) {
        var signingKey = new signing_key_1.SigningKey(this.privateKey);
        var sig = signingKey.signDigest(Wallet.hashMessage(message));
        return (convert_1.hexZeroPad(sig.r, 32) + convert_1.hexZeroPad(sig.s, 32).substring(2) + (sig.recoveryParam ? '1c' : '1b'));
    };
    Wallet.verifyMessage = function (message, signature) {
        signature = convert_1.hexlify(signature);
        if (signature.length != 132) {
            throw new Error('invalid signature');
        }
        var digest = Wallet.hashMessage(message);
        var recoveryParam = parseInt(signature.substring(130), 16);
        if (recoveryParam >= 27) {
            recoveryParam -= 27;
        }
        if (recoveryParam < 0) {
            throw new Error('invalid signature');
        }
        return signing_key_1.recoverAddress(digest, {
            r: signature.substring(0, 66),
            s: '0x' + signature.substring(66, 130),
            recoveryParam: recoveryParam
        });
    };
    Wallet.prototype.encrypt = function (password, options, progressCallback) {
        if (typeof (options) === 'function' && !progressCallback) {
            progressCallback = options;
            options = {};
        }
        if (progressCallback && typeof (progressCallback) !== 'function') {
            throw new Error('invalid callback');
        }
        if (!options) {
            options = {};
        }
        if (this.mnemonic) {
            // Make sure we don't accidentally bubble the mnemonic up the call-stack
            var safeOptions = {};
            for (var key in options) {
                safeOptions[key] = options[key];
            }
            options = safeOptions;
            // Set the mnemonic and path
            options.mnemonic = this.mnemonic;
            options.path = this.path;
        }
        return secretStorage.encrypt(this.privateKey, password, options, progressCallback);
    };
    Wallet.createRandom = function (options) {
        var entropy = random_bytes_1.randomBytes(16);
        if (!options) {
            options = {};
        }
        if (options.extraEntropy) {
            entropy = convert_1.arrayify(keccak256_1.keccak256(convert_1.concat([entropy, options.extraEntropy])).substring(0, 34));
        }
        var mnemonic = hdnode_1.entropyToMnemonic(entropy);
        return Wallet.fromMnemonic(mnemonic, options.path);
    };
    Wallet.isEncryptedWallet = function (json) {
        return (secretStorage.isValidWallet(json) || secretStorage.isCrowdsaleWallet(json));
    };
    Wallet.fromEncryptedWallet = function (json, password, progressCallback) {
        if (progressCallback && typeof (progressCallback) !== 'function') {
            throw new Error('invalid callback');
        }
        return new Promise(function (resolve, reject) {
            if (secretStorage.isCrowdsaleWallet(json)) {
                try {
                    var privateKey = secretStorage.decryptCrowdsale(json, password);
                    resolve(new Wallet(privateKey));
                }
                catch (error) {
                    reject(error);
                }
            }
            else if (secretStorage.isValidWallet(json)) {
                secretStorage.decrypt(json, password, progressCallback).then(function (signingKey) {
                    var wallet = new Wallet(signingKey);
                    /*
                    if (signingKey.mnemonic && signingKey.path) {
                        wallet.mnemonic = signingKey.mnemonic;
                        wallet.path = signingKey.path;
                    }
                    */
                    resolve(wallet);
                }, function (error) {
                    reject(error);
                });
            }
            else {
                reject('invalid wallet JSON');
            }
        });
    };
    Wallet.fromMnemonic = function (mnemonic, path) {
        if (!path) {
            path = defaultPath;
        }
        return new Wallet(hdnode_1.fromMnemonic(mnemonic).derivePath(path));
    };
    Wallet.fromBrainWallet = function (username, password, progressCallback) {
        if (progressCallback && typeof (progressCallback) !== 'function') {
            throw new Error('invalid callback');
        }
        if (typeof (username) === 'string') {
            username = utf8_1.toUtf8Bytes(username, utf8_1.UnicodeNormalizationForm.NFKC);
        }
        else {
            username = convert_1.arrayify(username);
        }
        if (typeof (password) === 'string') {
            password = utf8_1.toUtf8Bytes(password, utf8_1.UnicodeNormalizationForm.NFKC);
        }
        else {
            password = convert_1.arrayify(password);
        }
        return new Promise(function (resolve, reject) {
            scrypt_js_1.default(password, username, (1 << 18), 8, 1, 32, function (error, progress, key) {
                if (error) {
                    reject(error);
                }
                else if (key) {
                    resolve(new Wallet(convert_1.hexlify(key)));
                }
                else if (progressCallback) {
                    return progressCallback(progress);
                }
            });
        });
    };
    return Wallet;
}());
exports.Wallet = Wallet;
