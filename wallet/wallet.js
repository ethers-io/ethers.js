'use strict';

var scrypt = require('scrypt-js');

var utils = (function() {
    var convert = require('../utils/convert');
    return {
        defineProperty: require('../utils/properties').defineProperty,

        arrayify: convert.arrayify,
        concat: convert.concat,
        hexlify: convert.hexlify,
        stripZeros: convert.stripZeros,
        hexZeroPad: convert.hexZeroPad,

        bigNumberify: require('../utils/bignumber').bigNumberify,

        toUtf8Bytes: require('../utils/utf8').toUtf8Bytes,

        getAddress: require('../utils/address').getAddress,

        keccak256: require('../utils/keccak256'),

        //randomBytes: require('../utils/random-bytes'),
        randomBytes: require('../utils').randomBytes,

        RLP: require('../utils/rlp')
    };
})();

var errors = require('../utils/errors');

var HDNode = require('./hdnode');

var secretStorage = require('./secret-storage');
var SigningKey = require('./signing-key');

// This ensures we inject a setImmediate into the global space, which
// dramatically improves the performance of the scrypt PBKDF.
require('setimmediate');

var defaultPath = "m/44'/60'/0'/0/0";

var transactionFields = [
    {name: 'nonce',    maxLength: 32, },
    {name: 'gasPrice', maxLength: 32, },
    {name: 'gasLimit', maxLength: 32, },
    {name: 'to',          length: 20, },
    {name: 'value',    maxLength: 32, },
    {name: 'data'},
];

function Wallet(privateKey, provider) {
    errors.checkNew(this, Wallet);

    // Make sure we have a valid signing key
    var signingKey = privateKey;
    if (!(privateKey instanceof SigningKey)) {
        signingKey = new SigningKey(privateKey);
    }
    utils.defineProperty(this, 'privateKey', signingKey.privateKey);

    // Provider
    Object.defineProperty(this, 'provider', {
        enumerable: true,
        get: function() { return provider; },
        set: function(value) {
            provider = value;
        }
    });
    if (provider) { this.provider = provider; }

    var defaultGasLimit = 1500000;
    Object.defineProperty(this, 'defaultGasLimit', {
        enumerable: true,
        get: function() { return defaultGasLimit; },
        set: function(value) {
            if (typeof(value) !== 'number') { throw new Error('invalid defaultGasLimit'); }
            defaultGasLimit = value;
        }
    });

    utils.defineProperty(this, 'address', signingKey.address);

    utils.defineProperty(this, 'sign', function(transaction) {
        var chainId = transaction.chainId;
        if (chainId == null && this.provider) { chainId = this.provider.chainId; }
        if (!chainId) { chainId = 0; }

        var raw = [];
        transactionFields.forEach(function(fieldInfo) {
            var value = transaction[fieldInfo.name] || ([]);
            value = utils.arrayify(utils.hexlify(value), fieldInfo.name);

            // Fixed-width field
            if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
                var error = new Error('invalid ' + fieldInfo.name);
                error.reason = 'wrong length';
                error.value = value;
                throw error;
            }

            // Variable-width (with a maximum)
            if (fieldInfo.maxLength) {
                value = utils.stripZeros(value);
                if (value.length > fieldInfo.maxLength) {
                    var error = new Error('invalid ' + fieldInfo.name);
                    error.reason = 'too long';
                    error.value = value;
                    throw error;
                }
            }

            raw.push(utils.hexlify(value));
        });

        if (chainId) {
            raw.push(utils.hexlify(chainId));
            raw.push('0x');
            raw.push('0x');
        }

        var digest = utils.keccak256(utils.RLP.encode(raw));

        var signature = signingKey.signDigest(digest);

        var v = 27 + signature.recoveryParam
        if (chainId) {
            raw.pop();
            raw.pop();
            raw.pop();
            v += chainId * 2 + 8;
        }

        raw.push(utils.hexlify(v));
        raw.push(utils.stripZeros(utils.arrayify(signature.r)));
        raw.push(utils.stripZeros(utils.arrayify(signature.s)));

        return utils.RLP.encode(raw);
    });
}

utils.defineProperty(Wallet, 'parseTransaction', function(rawTransaction) {
    rawTransaction = utils.hexlify(rawTransaction, 'rawTransaction');
    var signedTransaction = utils.RLP.decode(rawTransaction);
    if (signedTransaction.length !== 9) { throw new Error('invalid transaction'); }

    var raw = [];

    var transaction = {};
    transactionFields.forEach(function(fieldInfo, index) {
        transaction[fieldInfo.name] = signedTransaction[index];
        raw.push(signedTransaction[index]);
    });

    if (transaction.to) {
        if (transaction.to == '0x') {
            delete transaction.to;
        } else {
            transaction.to = utils.getAddress(transaction.to);
        }
    }

    ['gasPrice', 'gasLimit', 'nonce', 'value'].forEach(function(name) {
        if (!transaction[name]) { return; }
        if (transaction[name].length === 0) {
            transaction[name] = utils.bigNumberify(0);
        } else {
            transaction[name] = utils.bigNumberify(transaction[name]);
        }
    });

    if (transaction.nonce) {
        transaction.nonce = transaction.nonce.toNumber();
    } else {
        transaction.nonce = 0;
    }

    var v = utils.arrayify(signedTransaction[6]);
    var r = utils.arrayify(signedTransaction[7]);
    var s = utils.arrayify(signedTransaction[8]);

    if (v.length >= 1 && r.length >= 1 && r.length <= 32 && s.length >= 1 && s.length <= 32) {
        transaction.v = utils.bigNumberify(v).toNumber();
        transaction.r = signedTransaction[7];
        transaction.s = signedTransaction[8];

        var chainId = (transaction.v - 35) / 2;
        if (chainId < 0) { chainId = 0; }
        chainId = parseInt(chainId);

        transaction.chainId = chainId;

        var recoveryParam = transaction.v - 27;

        if (chainId) {
            raw.push(utils.hexlify(chainId));
            raw.push('0x');
            raw.push('0x');
            recoveryParam -= chainId * 2 + 8;
        }

        var digest = utils.keccak256(utils.RLP.encode(raw));
        try {
            transaction.from = SigningKey.recover(digest, r, s, recoveryParam);
        } catch (error) {
            console.log(error);
        }
    }


    return transaction;
});

utils.defineProperty(Wallet.prototype, 'getAddress', function() {
    return this.address;
});

utils.defineProperty(Wallet.prototype, 'getBalance', function(blockTag) {
    if (!this.provider) { throw new Error('missing provider'); }
    return this.provider.getBalance(this.address, blockTag);
});

utils.defineProperty(Wallet.prototype, 'getTransactionCount', function(blockTag) {
    if (!this.provider) { throw new Error('missing provider'); }
    return this.provider.getTransactionCount(this.address, blockTag);
});

utils.defineProperty(Wallet.prototype, 'estimateGas', function(transaction) {
    if (!this.provider) { throw new Error('missing provider'); }

    var calculate = {};
    ['from', 'to', 'data', 'value'].forEach(function(key) {
        if (transaction[key] == null) { return; }
        calculate[key] = transaction[key];
    });

    if (transaction.from == null) { calculate.from = this.address; }

    return this.provider.estimateGas(calculate);
});

utils.defineProperty(Wallet.prototype, 'sendTransaction', function(transaction) {
    if (!this.provider) { throw new Error('missing provider'); }

    if (!transaction || typeof(transaction) !== 'object') {
        throw new Error('invalid transaction object');
    }

    var gasLimit = transaction.gasLimit;
    if (gasLimit == null) { gasLimit = this.defaultGasLimit; }

    var self = this;

    var gasPricePromise = null;
    if (transaction.gasPrice) {
        gasPricePromise = Promise.resolve(transaction.gasPrice);
    } else {
        gasPricePromise = this.provider.getGasPrice();
    }

    var noncePromise = null;
    if (transaction.nonce) {
        noncePromise = Promise.resolve(transaction.nonce);
    } else {
        noncePromise = this.provider.getTransactionCount(self.address, 'pending');
    }

    var chainId = this.provider.chainId;

    var toPromise = null;
    if (transaction.to) {
        toPromise = this.provider.resolveName(transaction.to);
    } else {
        toPromise = Promise.resolve(undefined);
    }

    var data = utils.hexlify(transaction.data || '0x');
    var value = utils.hexlify(transaction.value || 0);

    return Promise.all([gasPricePromise, noncePromise, toPromise]).then(function(results) {
        var signedTransaction = self.sign({
            to: results[2],
            data: data,
            gasLimit: gasLimit,
            gasPrice: results[0],
            nonce: results[1],
            value: value,
            chainId: chainId
        });

        return self.provider.sendTransaction(signedTransaction).then(function(hash) {
            var transaction = Wallet.parseTransaction(signedTransaction);
            transaction.hash = hash;
            transaction.wait = function() {
                return self.provider.waitForTransaction(hash);
            };
            return transaction;
        });
    });
});

utils.defineProperty(Wallet.prototype, 'send', function(addressOrName, amountWei, options) {
    if (!options) { options = {}; }

    return this.sendTransaction({
        to: addressOrName,
        gasLimit: options.gasLimit,
        gasPrice: options.gasPrice,
        nonce: options.nonce,
        value: amountWei,
    });
});

utils.defineProperty(Wallet, 'hashMessage', function (message) {
    var payload = utils.concat([
        utils.toUtf8Bytes('\x19Ethereum Signed Message:\n'),
        utils.toUtf8Bytes(String(message.length)),
        ((typeof(message) === 'string') ? utils.toUtf8Bytes(message): message)
    ]);
    return utils.keccak256(payload);
});

utils.defineProperty(Wallet.prototype, 'signMessage', function(message) {
    var signingKey = new SigningKey(this.privateKey);
    var sig = signingKey.signDigest(Wallet.hashMessage(message));

    return (utils.hexZeroPad(sig.r, 32) + utils.hexZeroPad(sig.s, 32).substring(2) + (sig.recoveryParam ? '1c': '1b'));
});

utils.defineProperty(Wallet, 'verifyMessage', function(message, signature) {
    signature = utils.hexlify(signature);
    if (signature.length != 132) { throw new Error('invalid signature'); }
    var digest = Wallet.hashMessage(message);

    var recoveryParam = parseInt(signature.substring(130), 16);
    if (recoveryParam >= 27) { recoveryParam -= 27; }
    if (recoveryParam < 0) { throw new Error('invalid signature'); }

    return SigningKey.recover(
        digest,
        signature.substring(0, 66),
        '0x' + signature.substring(66, 130),
        recoveryParam
    );
});

utils.defineProperty(Wallet.prototype, 'encrypt', function(password, options, progressCallback) {
    if (typeof(options) === 'function' && !progressCallback) {
        progressCallback = options;
        options = {};
    }

    if (progressCallback && typeof(progressCallback) !== 'function') {
        throw new Error('invalid callback');
    }

    if (!options) { options = {}; }

    if (this.mnemonic) {
        // Make sure we don't accidentally bubble the mnemonic up the call-stack
        var safeOptions = {};
        for (var key in options) { safeOptions[key] = options[key]; }
        options = safeOptions;

        // Set the mnemonic and path
        options.mnemonic = this.mnemonic;
        options.path = this.path
    }

    return secretStorage.encrypt(this.privateKey, password, options, progressCallback);
});


utils.defineProperty(Wallet, 'isEncryptedWallet', function(json) {
    return (secretStorage.isValidWallet(json) || secretStorage.isCrowdsaleWallet(json));
});



utils.defineProperty(Wallet, 'createRandom', function(options) {
    var entropy = utils.randomBytes(16);

    if (!options) { options = { }; }

    if (options.extraEntropy) {
        entropy = utils.keccak256(utils.concat([entropy, options.extraEntropy])).substring(0, 34);
    }

    var mnemonic = HDNode.entropyToMnemonic(entropy);
    return Wallet.fromMnemonic(mnemonic, options.path);
});


utils.defineProperty(Wallet, 'fromEncryptedWallet', function(json, password, progressCallback) {
    if (progressCallback && typeof(progressCallback) !== 'function') {
        throw new Error('invalid callback');
    }

    return new Promise(function(resolve, reject) {

        if (secretStorage.isCrowdsaleWallet(json)) {
            try {
                var privateKey = secretStorage.decryptCrowdsale(json, password);
                resolve(new Wallet(privateKey));
            } catch (error) {
                reject(error);
            }

        } else if (secretStorage.isValidWallet(json)) {

            secretStorage.decrypt(json, password, progressCallback).then(function(signingKey) {
                var wallet = new Wallet(signingKey);
                if (signingKey.mnemonic && signingKey.path) {
                    utils.defineProperty(wallet, 'mnemonic', signingKey.mnemonic);
                    utils.defineProperty(wallet, 'path', signingKey.path);
                }
                resolve(wallet);
                return null;
            }, function(error) {
                reject(error);
            }).catch(function(error) { reject(error); });

        } else {
            reject('invalid wallet JSON');
        }
    });
});

utils.defineProperty(Wallet, 'fromMnemonic', function(mnemonic, path) {
    if (!path) { path = defaultPath; }

    var hdnode = HDNode.fromMnemonic(mnemonic).derivePath(path);

    var wallet = new Wallet(hdnode.privateKey);
    utils.defineProperty(wallet, 'mnemonic', mnemonic);
    utils.defineProperty(wallet, 'path', path);

    return wallet;
});


utils.defineProperty(Wallet, 'fromBrainWallet', function(username, password, progressCallback) {
    if (progressCallback && typeof(progressCallback) !== 'function') {
        throw new Error('invalid callback');
    }

    if (typeof(username) === 'string') {
        username =  utils.toUtf8Bytes(username, 'NFKC');
    } else {
        username = utils.arrayify(username, 'password');
    }

    if (typeof(password) === 'string') {
        password =  utils.toUtf8Bytes(password, 'NFKC');
    } else {
        password = utils.arrayify(password, 'password');
    }

    return new Promise(function(resolve, reject) {
        scrypt(password, username, (1 << 18), 8, 1, 32, function(error, progress, key) {
            if (error) {
                reject(error);

            } else if (key) {
                resolve(new Wallet(utils.hexlify(key)));

            } else if (progressCallback) {
                return progressCallback(progress);
            }
        });
    });
});

//utils.defineProperty(Wallet, 'isCrowdsaleWallet', secretStorage.isCrowdsaleWallet);

//utils.defineProperty(Wallet, 'decryptCrowdsale', function(json, password) {
//    return new Wallet(secretStorage.decryptCrowdsale(json, password));
//});

module.exports = Wallet;
