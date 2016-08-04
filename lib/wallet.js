'use strict';

var rlp = require('rlp');

var Contract = require('./contract.js');
var providers = require('./providers.js');
var SigningKey = require('./signing-key.js');

var utils = require('./utils.js');


var transactionFields = [
    {name: 'nonce',    maxLength: 32, },
    {name: 'gasPrice', maxLength: 32, },
    {name: 'gasLimit', maxLength: 32, },
    {name: 'to',          length: 20, },
    {name: 'value',    maxLength: 32, },
    {name: 'data'},
];

function Wallet(privateKey, provider) {
    if (!(this instanceof Wallet)) { throw new Error('missing new'); }

    // Make sure we have a valid signing key
    var signingKey = privateKey;
    if (!(privateKey instanceof SigningKey)) {
        signingKey = new SigningKey(privateKey);
    }
    utils.defineProperty(this, 'privateKey', signingKey.privateKey);

    Object.defineProperty(this, 'provider', {
        enumerable: true,
        get: function() { return provider; },
        set: function(value) {
            if (value !== null && !providers.isProvider(value)) {
                throw new Error('invalid provider');
            }
            provider = value;
        }
    });

    Object.defineProperty(this, '_provider', {
        enumerable: true,
        get: function() {
            if (!provider) { throw new Error('missing provider'); }
            return provider;
        },
    });

    if (provider !== null) {

        // If no provider was provided, check for metamask or ilk
        if (provider === undefined) {
            if (global.web3 && global.web3.currentProvider && global.web3.currentProvider.sendAsync) {
                this.provider = new providers.Web3Provider(global.web3.currentProvider);
            }

        // An Ethereum RPC node
        } else if (typeof(provider) === 'string' && provider.match(/^https?:\/\//)) {
            this.provider = new providers.HttpProvider(provider);

        } else {
            this.provider = provider;
        }
    }

    utils.defineProperty(this, 'address', signingKey.address);

    utils.defineProperty(this, 'sign', function(transaction) {
        var raw = [];
        transactionFields.forEach(function(fieldInfo) {
            var value = transaction[fieldInfo.name] || (new Buffer(0));
            value = utils.hexOrBuffer(utils.hexlify(value), fieldInfo.name);

            // Fixed-width field
            if (fieldInfo.length && value.length !== fieldInfo.length) {
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

            raw.push(value);
        });

        var digest = utils.sha3(rlp.encode(raw));

        var signature = signingKey.signDigest(digest);
        var s = signature.s;
        var v = signature.recoveryParam;

        raw.push(new Buffer([27 + v]));
        raw.push(utils.bnToBuffer(signature.r));
        raw.push(utils.bnToBuffer(s));

        return ('0x' + rlp.encode(raw).toString('hex'));
    });
}

utils.defineProperty(Wallet.prototype, 'getBalance', function(blockNumber) {
    var provider = this._provider;

    var self = this;
    return new Promise(function(resolve, reject) {
        provider.getBalance(self.address, blockNumber).then(function(balance) {
            resolve(balance);
        }, function(error) {
            reject(error);
        });
    });
});

utils.defineProperty(Wallet.prototype, 'getTransactionCount', function(blockNumber) {
    var provider = this._provider;

    var self = this;
    return new Promise(function(resolve, reject) {
        provider.getTransactionCount(self.address, blockNumber).then(function(transactionCount) {
            resolve(transactionCount);
        }, function(error) {
            reject(error);
        });
    });
});

utils.defineProperty(Wallet.prototype, 'estimateGas', function(transaction) {
    var provider = this._provider;

    transaction = utils.cloneObject(transaction);
    if (transaction.from == null) { transaction.from = this.address; }

    return new Promise(function(resolve, reject) {
        provider.estimateGas(transaction).then(function(gasEstimate) {
            resolve(gasEstimate);
        }, function(error) {
            reject(error);
        });
    });
});

utils.defineProperty(Wallet.prototype, 'sendTransaction', function(transaction) {
    var gasLimit = transaction.gasLimit;
    if (gasLimit == null) { gasLimit = 3000000; }

    var self = this;

    var provider = this._provider;

    var gasPrice = new Promise(function(resolve, reject) {
        if (transaction.gasPrice) {
            return resolve(transaction.gasPrice);
        }
        provider.getGasPrice().then(function(gasPrice) {
            resolve(gasPrice);
        }, function(error) {
            reject(error);
        });
    });

    var nonce = new Promise(function(resolve, reject) {
        if (transaction.nonce) {
            return resolve(transaction.nonce);
        }
        provider.getTransactionCount(self.address, 'pending').then(function(transactionCount) {
            resolve(transactionCount);
        }, function(error) {
            reject(error);
        });
    });

    return new Promise(function(resolve, reject) {
        Promise.all([gasPrice, nonce]).then(function(results) {
            var signedTransaction = self.sign({
                to: transaction.to,
                gasLimit: gasLimit,
                gasPrice: results[0],
                nonce: results[1],
                value: transaction.value
            });

            provider.sendTransaction(signedTransaction).then(function(txid) {
                resolve(txid);
            }, function(error) {
                reject(error);
            });

        }, function(error) {
            reject(error);
        });
    });
});

utils.defineProperty(Wallet.prototype, 'send', function(address, amountWei, options) {
    address = SigningKey.getAddress(address);
    if (utils.BN.isBN(amountWei)) {
        amountWei = '0x' + utils.bnToBuffer(amountWei).toString('hex');
    }
    if (!utils.isHexString(amountWei)) { throw new Error('invalid amountWei'); }

    if (!options) { options = {}; }

    return this.sendTransaction({
        to: address,
        gasLimit: options.gasLimit,
        gasPrice: options.gasPrice,
        nonce: options.nonce,
        value: amountWei,
    });
});

utils.defineProperty(Wallet.prototype, 'getContract', function(address, abi) {
    return new Contract(this, address, new Contract.Interface(abi));
});


utils.defineProperty(Wallet, 'getAddress', SigningKey.getAddress);
utils.defineProperty(Wallet, 'getIcapAddress', SigningKey.getIcapAddress);

utils.defineProperty(Wallet, '_Contract', Contract);

var zero = new utils.BN(0);
var negative1 = new utils.BN(-1);
var tenPower18 = new utils.BN('1000000000000000000');
utils.defineProperty(Wallet, 'formatEther', function(wei, options) {
    if (typeof(wei) === 'number') { wei = new utils.BN(wei); }
    if (!options) { options = {}; }

    if (!(wei instanceof utils.BN)) { throw new Error('invalid wei'); }

    var negative = wei.lt(zero);
    if (negative) { wei = wei.mul(negative1); }

    var fraction = wei.mod(tenPower18).toString(10);
    while (fraction.length < 18) { fraction = '0' + fraction; }

    if (!options.pad) {
        fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
    }

    var whole = wei.div(tenPower18).toString(10);

    if (options.commify) {
        whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    var value = whole + '.' + fraction;

    if (negative) { value = '-' + value; }

    return value;
});

utils.defineProperty(Wallet, 'parseEther', function(ether) {
    if (typeof(ether) !== 'string' || !ether.match(/^-?[0-9.]+$/)) {
        throw new Error('invalid value');
    }

    // Is it negative?
    var negative = (ether.substring(0, 1) === '-');
    if (negative) { ether = ether.substring(1); }

    if (ether === '.') { throw new Error('invalid value'); }

    // Split it into a whole and fractional part
    var comps = ether.split('.');
    if (comps.length > 2) { throw new Error('too many decimal points'); }

    var whole = comps[0], fraction = comps[1];
    if (!whole) { whole = '0'; }
    if (!fraction) { fraction = '0'; }
    if (fraction.length > 18) { throw new Error('too many decimal places'); }

    while (fraction.length < 18) { fraction += '0'; }

    whole = new utils.BN(whole);
    fraction = new utils.BN(fraction);

    var wei = (whole.mul(tenPower18)).add(fraction);

    if (negative) { wei = wei.mul(negative1); }

    return wei;
});

module.exports = Wallet;
