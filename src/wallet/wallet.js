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
var address_1 = require("../utils/address");
var bignumber_1 = require("../utils/bignumber");
var convert_1 = require("../utils/convert");
var keccak256_1 = require("../utils/keccak256");
var random_bytes_1 = require("../utils/random-bytes");
var RLP = __importStar(require("../utils/rlp"));
var utf8_1 = require("../utils/utf8");
var errors = __importStar(require("../utils/errors"));
// This ensures we inject a setImmediate into the global space, which
// dramatically improves the performance of the scrypt PBKDF.
console.log("Fix this! Setimmediate");
var defaultPath = "m/44'/60'/0'/0/0";
var transactionFields = [
    { name: 'nonce', maxLength: 32, },
    { name: 'gasPrice', maxLength: 32, },
    { name: 'gasLimit', maxLength: 32, },
    { name: 'to', length: 20, },
    { name: 'value', maxLength: 32, },
    { name: 'data' },
];
// @TODO: Bytes32 or SigningKey
var Wallet = /** @class */ (function () {
    function Wallet(privateKey, provider) {
        //private _provider;
        this.defaultGasLimit = 1500000;
        errors.checkNew(this, Wallet);
        // Make sure we have a valid signing key
        if (privateKey instanceof signing_key_1.SigningKey) {
            this.signingKey = privateKey;
            if (this.signingKey.mnemonic) {
                Object.defineProperty(this, 'mnemonic', {
                    enumerable: true,
                    value: this.signingKey.mnemonic,
                    writable: false
                });
                //this.mnemonic = this.signingKey.mnemonic;
                this.path = this.signingKey.path;
            }
        }
        else {
            this.signingKey = new signing_key_1.SigningKey(privateKey);
        }
        this.privateKey = this.signingKey.privateKey;
        this.provider = provider;
        //this.address = this.signingKey.address;
        Object.defineProperty(this, 'address', {
            enumerable: true,
            value: this.signingKey.address,
            writable: false
        });
    }
    Wallet.prototype.sign = function (transaction) {
        var chainId = transaction.chainId;
        if (chainId == null && this.provider) {
            chainId = this.provider.chainId;
        }
        if (!chainId) {
            chainId = 0;
        }
        var raw = [];
        transactionFields.forEach(function (fieldInfo) {
            var value = transaction[fieldInfo.name] || ([]);
            value = convert_1.arrayify(convert_1.hexlify(value));
            // Fixed-width field
            if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
                var error = new Error('invalid ' + fieldInfo.name);
                error.reason = 'wrong length';
                error.value = value;
                throw error;
            }
            // Variable-width (with a maximum)
            if (fieldInfo.maxLength) {
                value = convert_1.stripZeros(value);
                if (value.length > fieldInfo.maxLength) {
                    var error = new Error('invalid ' + fieldInfo.name);
                    error.reason = 'too long';
                    error.value = value;
                    throw error;
                }
            }
            raw.push(convert_1.hexlify(value));
        });
        if (chainId) {
            raw.push(convert_1.hexlify(chainId));
            raw.push('0x');
            raw.push('0x');
        }
        var digest = keccak256_1.keccak256(RLP.encode(raw));
        var signature = this.signingKey.signDigest(digest);
        var v = 27 + signature.recoveryParam;
        if (chainId) {
            raw.pop();
            raw.pop();
            raw.pop();
            v += chainId * 2 + 8;
        }
        raw.push(convert_1.hexlify(v));
        raw.push(signature.r);
        raw.push(signature.s);
        return RLP.encode(raw);
    };
    /*
        set provider(provider: Provider) {
            this._provider = provider;
        }
    
        get provider() {
            return this._provider;
        }
    */
    Wallet.parseTransaction = function (rawTransaction) {
        rawTransaction = convert_1.hexlify(rawTransaction);
        var signedTransaction = RLP.decode(rawTransaction);
        if (signedTransaction.length !== 9) {
            throw new Error('invalid transaction');
        }
        var raw = [];
        var transaction = {};
        transactionFields.forEach(function (fieldInfo, index) {
            transaction[fieldInfo.name] = signedTransaction[index];
            raw.push(signedTransaction[index]);
        });
        if (transaction.to) {
            if (transaction.to == '0x') {
                delete transaction.to;
            }
            else {
                transaction.to = address_1.getAddress(transaction.to);
            }
        }
        ['gasPrice', 'gasLimit', 'nonce', 'value'].forEach(function (name) {
            if (!transaction[name]) {
                return;
            }
            var value = bignumber_1.ConstantZero;
            if (transaction[name].length > 0) {
                value = bignumber_1.bigNumberify(transaction[name]);
            }
            transaction[name] = value;
        });
        transaction.nonce = transaction.nonce.toNumber();
        var v = convert_1.arrayify(signedTransaction[6]);
        var r = convert_1.arrayify(signedTransaction[7]);
        var s = convert_1.arrayify(signedTransaction[8]);
        if (v.length >= 1 && r.length >= 1 && r.length <= 32 && s.length >= 1 && s.length <= 32) {
            transaction.v = bignumber_1.bigNumberify(v).toNumber();
            transaction.r = signedTransaction[7];
            transaction.s = signedTransaction[8];
            var chainId = (transaction.v - 35) / 2;
            if (chainId < 0) {
                chainId = 0;
            }
            chainId = Math.trunc(chainId);
            transaction.chainId = chainId;
            var recoveryParam = transaction.v - 27;
            if (chainId) {
                raw.push(convert_1.hexlify(chainId));
                raw.push('0x');
                raw.push('0x');
                recoveryParam -= chainId * 2 + 8;
            }
            var digest = keccak256_1.keccak256(RLP.encode(raw));
            try {
                transaction.from = signing_key_1.recoverAddress(digest, { r: convert_1.hexlify(r), s: convert_1.hexlify(s), recoveryParam: recoveryParam });
            }
            catch (error) {
                console.log(error);
            }
        }
        return transaction;
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
        if (!this.provider) {
            throw new Error('missing provider');
        }
        if (!transaction || typeof (transaction) !== 'object') {
            throw new Error('invalid transaction object');
        }
        var gasLimit = transaction.gasLimit;
        if (gasLimit == null) {
            gasLimit = this.defaultGasLimit;
        }
        var self = this;
        var gasPricePromise = null;
        if (transaction.gasPrice) {
            gasPricePromise = Promise.resolve(transaction.gasPrice);
        }
        else {
            gasPricePromise = this.provider.getGasPrice();
        }
        var noncePromise = null;
        if (transaction.nonce) {
            noncePromise = Promise.resolve(transaction.nonce);
        }
        else {
            noncePromise = this.provider.getTransactionCount(self.address, 'pending');
        }
        var chainId = this.provider.chainId;
        var toPromise = null;
        if (transaction.to) {
            toPromise = this.provider.resolveName(transaction.to);
        }
        else {
            toPromise = Promise.resolve(undefined);
        }
        var data = convert_1.hexlify(transaction.data || '0x');
        var value = bignumber_1.ConstantZero;
        return Promise.all([gasPricePromise, noncePromise, toPromise]).then(function (results) {
            var signedTransaction = self.sign({
                to: results[2],
                data: data,
                gasLimit: gasLimit,
                gasPrice: results[0],
                nonce: results[1],
                value: value,
                chainId: chainId
            });
            return self.provider.sendTransaction(signedTransaction).then(function (hash) {
                var transaction = Wallet.parseTransaction(signedTransaction);
                transaction.hash = hash;
                transaction.wait = function () {
                    return self.provider.waitForTransaction(hash);
                };
                return transaction;
            });
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
