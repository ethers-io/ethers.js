var aes = require('aes-js');
var elliptic = require('elliptic');
//var elliptic = require('./elliptic/lib/elliptic.js');
var pbkdf2 = require('pbkdf2');
var rlp = require('rlp');
var scrypt = require('scrypt-js');
var uuid = require('uuid');

var Contract = require('./lib/contract.js');

var utils = require('./lib/utils.js');
var BN = utils.BN;

var secp256k1 = new (elliptic.ec)('secp256k1');

/*
// @TODO: Make our own implementation of rlp; the existing one is MLP-2.0, we want MIT. :)
function rlpEncodeLength(length) {
}

function rlpArray(items) {
    var output = new Buffer(0);
    for (var i = 0; i < items.length; i++) {
    }
}
*/

function defineProperty(object, name, value) {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value
    });
}

var exportUtils = {};

// These may go away in the future...
defineProperty(exportUtils, '_aes', aes);
defineProperty(exportUtils, '_scrypt', scrypt);

defineProperty(exportUtils, 'BN', BN);
defineProperty(exportUtils, 'Buffer', Buffer);
defineProperty(exportUtils, 'sha3', utils.sha3);
defineProperty(exportUtils, 'sha256', utils.sha256);

function getChecksumAddress(address) {
    if (typeof(address) !== 'string' || !address.match(/^0x[0-9A-Fa-f]{40}$/)) {
        throw new Error('invalid address');
    }

    address = address.substring(2).toLowerCase();
    var hashed = utils.sha3(address);

    address = address.split('');
    for (var i = 0; i < 40; i += 2) {
        if ((hashed[i >> 1] >> 4) >= 8) {
            address[i] = address[i].toUpperCase();
        }
        if ((hashed[i >> 1] & 0x0f) >= 8) {
            address[i + 1] = address[i + 1].toUpperCase();
        }
    }

    return '0x' + address.join('');
}

// See: https://en.wikipedia.org/wiki/International_Bank_Account_Number
var ibanChecksum = (function() {

    // Create lookup table
    var ibanLookup = {};
    for (var i = 0; i < 10; i++) { ibanLookup[String(i)] = String(i); }
    for (var i = 0; i < 26; i++) { ibanLookup[String.fromCharCode(65 + i)] = String(10 + i); }

    // How many decimal digits can we process? (for 64-bit float, this is 15)
    var safeDigits = Math.floor(Math.log10(Number.MAX_SAFE_INTEGER));

    return function(address) {
        address = address.toUpperCase();
        address = address.substring(4) + address.substring(0, 2) + '00';

        var expanded = address.split('');
        for (var i = 0; i < expanded.length; i++) {
            expanded[i] = ibanLookup[expanded[i]];
        }
        expanded = expanded.join('');

        // Javascript can handle integers safely up to 15 (decimal) digits
        while (expanded.length >= safeDigits){
            var block = expanded.substring(0, safeDigits);
            expanded = parseInt(block, 10) % 97 + expanded.substring(block.length);
        }

        checksum = String(98 - (parseInt(expanded, 10) % 97));
        while (checksum.length < 2) { checksum = '0' + checksum; }

        return checksum;
    };
})();

// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
defineProperty(exportUtils, 'getContractAddress', function(transaction) {
    if (typeof(address) !== 'string' || !address.match(/^0x[0-9A-Fa-f]{40}$/)) {
        throw new Error('invalid from');
    }

    return '0x' + utils.sha3(rlp.encode([
        utils.hexOrBuffer(transaction.from),
        utils.hexOrBuffer(utils.hexlify(transaction.nonce, 'nonce'))
    ])).slice(12).toString('hex');
});

var transactionFields = [
    {name: 'nonce',    maxLength: 32, },
    {name: 'gasPrice', maxLength: 32, },
    {name: 'gasLimit', maxLength: 32, },
    {name: 'to',          length: 20, },
    {name: 'value',    maxLength: 32, },
    {name: 'data'},
];


function Wallet(privateKey) {
    if (!(this instanceof Wallet)) { throw new Error('missing new'); }

    if (typeof(privateKey) === 'string' && privateKey.match(/^0x[0-9A-Fa-f]{64}$/)) {
        privateKey = new Buffer(privateKey.substring(2), 'hex');
    } else if (!Buffer.isBuffer(privateKey) || privateKey.length !== 32) {
        throw new Error('invalid private key');
    }

    var keyPair = secp256k1.keyFromPrivate(privateKey);

    var publicKey = (new Buffer(keyPair.getPublic(false, 'hex'), 'hex')).slice(1);
    var address = Wallet.getAddress(utils.sha3(publicKey).slice(12).toString('hex'));
    defineProperty(this, 'address', address);

    defineProperty(this, 'sign', function(transaction) {
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

        var signature = keyPair.sign(digest, {canonical: true});
        var s = signature.s;
        var v = signature.recoveryParam;

        raw.push(new Buffer([27 + v]));
        raw.push(utils.bnToBuffer(signature.r));
        raw.push(utils.bnToBuffer(s));

        return ('0x' + rlp.encode(raw).toString('hex'));
    });
}

defineProperty(Wallet, 'utils', exportUtils);

defineProperty(Wallet, 'getAddress', function(address) {
    var result = null;

    if (typeof(address) !== 'string') { throw new Error('invalid address'); }

    if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {

        // Missing the 0x prefix
        if (address.substring(0, 2) !== '0x') { address = '0x' + address; }

        result = getChecksumAddress(address);

        // It is a checksummed address with a bad checksum
        if (address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && result !== address) {
            throw new Error('invalid address checksum');
        }

    // Maybe ICAP? (we only support direct mode)
    } else if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {

        // It is an ICAP address with a bad checksum
        if (address.substring(2, 4) !== ibanChecksum(address)) {
            throw new Error('invalid address icap checksum');
        }

        result = (new BN(address.substring(4), 36)).toString(16);
        while (result.length < 40) { result = '0' + result; }
        result = getChecksumAddress('0x' + result);

    } else {
        throw new Error('invalid address');
    }

    return result;
});

defineProperty(Wallet, 'getIcapAddress', function(address) {
    address = Wallet.getAddress(address).substring(2);
    var base36 = (new BN(address, 16)).toString(36).toUpperCase();
    while (base36.length < 30) { base36 = '0' + base36; }
    return 'XE' + ibanChecksum('XE00' + base36) + base36;
});

defineProperty(Wallet, '_Contract', Contract);

var allowedTransactionKeys = {
    data: true, from: true, gasLimit: true, gasPrice:true, to: true, value: true
}
function AttachedContract(web3, wallet, contractAddress, contract) {
    utils.defineProperty(this, 'web3', web3);
    utils.defineProperty(this, 'wallet', wallet);
    utils.defineProperty(this, 'contractAddress', contractAddress);

    utils.defineProperty(this, '_contract', contract);

    function getWeb3Promise(method) {
        var params = Array.prototype.slice.call(arguments, 1);
        return new Promise(function(resolve, reject) {
            params.push(function(error, result) {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });
            web3.eth[method].apply(web3, params);
        });
    }

    var self = this;

    var filters = {};
    function setupFilter(call, callback) {
        var info = filters[call.name];

        // Stop and remove the filter
        if (!callback) {
            if (info) { info.filter.stopWatching(); }
            delete filters[call.name];
            return;
        }

        if (typeof(callback) !== 'function') {
            throw new Error('invalid callback');
        }

        // Already have a filter, just update the callback
        if (info) {
            info.callback = callback;
            return;
        }

        info = {callback: callback};
        filters[call.name] = info;

        // Start a new filter
        info.filter = web3.eth.filter({
            address: contractAddress,
            topics: call.topics
        }, function(error, result) {
            // @TODO: Emit errors to .onerror? Maybe?
            if (error) {
                console.log(error);
                return;
            }

            try {
                info.callback.apply(self, call.parse(result.data));
            } catch(error) {
                console.log(error);
            }
        });
    }

    function runMethod(method) {
        return function() {
            var transaction = {}

            var params = Array.prototype.slice.call(arguments);
            if (params.length == contract[method].inputs.length + 1) {
                transaction = params.pop();
                if (typeof(transaction) !== 'object') {
                    throw new Error('invalid transaction overrides');
                }
                for (var key in transaction) {
                    if (!allowedTransactionKeys[key]) {
                        throw new Error('unknown transaction override ' + key);
                    }
                }
            }

            var call = contract[method].apply(contract, params);
            switch (call.type) {
                case 'call':
                    ['data', 'gasLimit', 'gasPrice', 'to', 'value'].forEach(function(key) {
                        if (transaction[key] != null) {
                            throw new Error('call cannot override ' + key) ;
                        }
                    });
                    transaction.data = call.data;
                    if (transaction.from == null) {
                        transaction.from = wallet.address;
                    }
                    transaction.to = contractAddress;

                    return new Promise(function(resolve, reject) {
                        getWeb3Promise('call', transaction).then(function(value) {
                            resolve(call.parse(value));
                        }, function(error) {
                            reject(error);
                        });
                    });

                case 'transaction':
                    ['data', 'from', 'to'].forEach(function(key) {
                        if (transaction[key] != null) {
                            throw new Error('transaction cannot override ' + key) ;
                        }
                    });
                    transaction.data = call.data;
                    transaction.to = contractAddress;
                    if (transaction.gasLimit == null) {
                        transaction.gasLimit = 3000000;
                    }

                    return new Promise(function(resolve, reject) {
                        Promise.all([
                            getWeb3Promise('getTransactionCount', wallet.address, 'pending'),
                            getWeb3Promise('getGasPrice'),
                        ]).then(function(results) {
                            if (transaction.nonce == null) {
                                transaction.nonce = results[0];
                            } else if (console.warn) {
                                console.warn('Overriding suggested nonce: ' + results[0]);
                            }
                            if (transaction.gasPrice == null) {
                                transaction.gasPrice = results[1];
                            } else if (console.warn) {
                                console.warn('Overriding suggested gasPrice: ' + utils.hexlify(results[1]));
                            }
                            var signedTransaction = wallet.sign(transaction);
                            /*
                                data: call.data,
                                gasLimit: 3000000,
                                gasPrice: results[1],
                                nonce: results[0],
                                to: contractAddress,
                            });
                                */
                            getWeb3Promise('sendRawTransaction', signedTransaction).then(function(txid) {
                                resolve(txid);
                            }, function(error) {
                                reject(error);
                            });
                        }, function(error) {
                            reject(error);
                        });
                    });
            }
        };
    }

    contract.methods.forEach(function(method) {
        utils.defineProperty(this, method, runMethod(method));
    }, this);

    contract.events.forEach(function(method) {
        var call = contract[method].apply(contract, []);
        Object.defineProperty(self, 'on' + call.name.toLowerCase(), {
            enumerable: true,
            get: function() {
                console.log('get');
                var info = filters[call.name];
                if (!info || !info[call.name]) { return null; }
                return info.callback;
            },
            set: function(value) {
                console.log('set');
                setupFilter(call, value);
            }
        });
    }, this);
}

defineProperty(Wallet.prototype, 'getContract', function(web3, address, abi) {
    return new AttachedContract(web3, this, address, new Contract(abi));
});

module.exports = Wallet;
