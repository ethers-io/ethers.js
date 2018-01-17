'use strict';

var utils = require('ethers-utils');

var Provider = require('./provider');
var JsonRpcProvider = require('./json-rpc-provider');


function Web3Signer(provider, address) {
    if (!(this instanceof Web3Signer)) { throw new Error('missing new'); }
    utils.defineProperty(this, 'provider', provider);

    // Statically attach to a given address
    if (address) {
        utils.defineProperty(this, 'address', address);
        utils.defineProperty(this, '_syncAddress', true);

    } else {
        Object.defineProperty(this, 'address', {
            enumerable: true,
            get: function() {
                throw new Error('unsupported sync operation; use getAddress');
            }
        });
        utils.defineProperty(this, '_syncAddress', false);
    }
}

utils.defineProperty(Web3Signer.prototype, 'getAddress', function() {
    if (this._syncAddress) { return Promise.resolve(this.address); }

    return this.provider.send('eth_accounts', []).then(function(accounts) {
        if (accounts.length === 0) {
            throw new Error('no account');
        }
        return utils.getAddress(accounts[0]);
    });
});

utils.defineProperty(Web3Signer.prototype, 'getBalance', function(blockTag) {
    var provider = this.provider;
    return this.getAddress().then(function(address) {
        return provider.getBalance(address, blockTag);
    });
});

utils.defineProperty(Web3Signer.prototype, 'getTransactionCount', function(blockTag) {
    var provider = this.provider;
    return this.getAddress().then(function(address) {
        return provider.getTransactionCount(address, blockTag);
    });
});

utils.defineProperty(Web3Signer.prototype, 'sendTransaction', function(transaction) {
    var provider = this.provider;
    transaction = JsonRpcProvider._hexlifyTransaction(transaction);
    return this.getAddress().then(function(address) {
        transaction.from = address.toLowerCase();
        return provider.send('eth_sendTransaction', [ transaction ]).then(function(hash) {
            return new Promise(function(resolve, reject) {
                function check() {
                    provider.getTransaction(hash).then(function(transaction) {
                        if (!transaction) {
                            setTimeout(check, 1000);
                            return;
                        }
                        resolve(transaction);
                    });
                }
                check();
            });
        });
    });
});

utils.defineProperty(Web3Signer.prototype, 'signMessage', function(message) {
    var provider = this.provider;

    var data = ((typeof(message) === 'string') ? utils.toUtf8Bytes(message): message);
    return this.getAddress().then(function(address) {

        // https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
        var method = 'eth_sign';
        var params = [ address.toLowerCase(), utils.hexlify(data) ];

        // Metamask complains about eth_sign (and on some versions hangs)
        if (provider._web3Provider.isMetaMask) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = 'personal_sign';
            params = [ utils.hexlify(data), address.toLowerCase() ];
        }

        return provider.send(method, params);
    });
});

utils.defineProperty(Web3Signer.prototype, 'unlock', function(password) {
    var provider = this.provider;

    return this.getAddress().then(function(address) {
        return provider.send('personal_unlockAccount', [ address.toLowerCase(), password, null ]);
    });
});

/*
@TODO
utils.defineProperty(Web3Signer, 'onchange', {

});
*/

function Web3Provider(web3Provider, network) {
    if (!(this instanceof Web3Provider)) { throw new Error('missing new'); }

    // HTTP has a host; IPC has a path.
    var url = web3Provider.host || web3Provider.path || 'unknown';

    // No need to support legacy parameters since this is post-legacy network
    if (network == null) {
        network = Provider.networks.homestead;
    } else if (typeof(network) === 'string') {
        network = Provider.networks[network];
        if (!network) { throw new Error('invalid network'); }
    }

    JsonRpcProvider.call(this, url, network);
    utils.defineProperty(this, '_web3Provider', web3Provider);
}
JsonRpcProvider.inherits(Web3Provider);

utils.defineProperty(Web3Provider.prototype, 'getSigner', function(address) {
    return new Web3Signer(this, address);
});

utils.defineProperty(Web3Provider.prototype, 'listAccounts', function() {
    return this.send('eth_accounts', []).then(function(accounts) {
        accounts.forEach(function(address, index) {
            accounts[index] = utils.getAddress(address);
        });
        return accounts;
    });
});

utils.defineProperty(Web3Provider.prototype, 'send', function(method, params) {
    var provider = this._web3Provider;
    return new Promise(function(resolve, reject) {
        var request = {
            method: method,
            params: params,
            id: 42,
            jsonrpc: "2.0"
        };
        provider.sendAsync(request, function(error, result) {
            if (error) {
                reject(error);
                return;
            }
            if (result.error) {
                var error = new Error(result.error.message);
                error.code = result.error.code;
                error.data = result.error.data;
                reject(error);
                return;
            }
            resolve(result.result);
        });
    });
});

module.exports = Web3Provider;
