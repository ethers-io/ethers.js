'use strict';

// See: https://github.com/ethereum/wiki/wiki/JSON-RPC

var Provider = require('./provider.js');

var utils = (function() {
    var convert = require('../utils/convert');
    return {
        defineProperty: require('../utils/properties').defineProperty,

        hexlify: convert.hexlify,
        isHexString: convert.isHexString,
        hexStripZeros: convert.hexStripZeros,
    }
})();

function timer(timeout) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, timeout);
    });
}

function getResult(payload) {
    if (payload.error) {
        var error = new Error(payload.error.message);
        error.code = payload.error.code;
        error.data = payload.error.data;
        throw error;
    }

    return payload.result;
}

function getTransaction(transaction) {
    var result = {};

    for (var key in transaction) {
        result[key] = utils.hexlify(transaction[key]);
    }

    // Some nodes (INFURA ropsten; INFURA mainnet is fine) don't like extra zeros.
    ['gasLimit', 'gasPrice', 'nonce', 'value'].forEach(function(key) {
        if (!result[key]) { return; }
        result[key] = utils.hexStripZeros(result[key]);
    });

    // Transform "gasLimit" to "gas"
    if (result.gasLimit != null && result.gas == null) {
        result.gas = result.gasLimit;
        delete result.gasLimit;
    }

    return result;
}

function JsonRpcProvider(url, network) {
    if (!(this instanceof JsonRpcProvider)) { throw new Error('missing new'); }

    if (arguments.length == 1) {
        if (typeof(url) === 'string') {
            try {
                network = Provider.getNetwork(url);
                url = null;
            } catch (error) { }
        } else {
            network = url;
            url = null;
        }
    }

    Provider.call(this, network);

    if (!url) { url = 'http://localhost:8545'; }

    utils.defineProperty(this, 'url', url);
}
Provider.inherits(JsonRpcProvider);

utils.defineProperty(JsonRpcProvider.prototype, 'send', function(method, params) {
    var request = {
        method: method,
        params: params,
        id: 42,
        jsonrpc: "2.0"
    };
    return Provider.fetchJSON(this.url, JSON.stringify(request), getResult);
});

utils.defineProperty(JsonRpcProvider.prototype, 'perform', function(method, params) {
    switch (method) {
        case 'getBlockNumber':
            return this.send('eth_blockNumber', []);

        case 'getGasPrice':
            return this.send('eth_gasPrice', []);

        case 'getBalance':
            return this.send('eth_getBalance', [params.address, params.blockTag]);

        case 'getTransactionCount':
            return this.send('eth_getTransactionCount', [params.address, params.blockTag]);

        case 'getCode':
            return this.send('eth_getCode', [params.address, params.blockTag]);

        case 'getStorageAt':
            return this.send('eth_getStorageAt', [params.address, params.position, params.blockTag]);

        case 'sendTransaction':
            return this.send('eth_sendRawTransaction', [params.signedTransaction]);

        case 'getBlock':
            if (params.blockTag) {
                return this.send('eth_getBlockByNumber', [params.blockTag, false]);
            } else if (params.blockHash) {
                return this.send('eth_getBlockByHash', [params.blockHash, false]);
            }
            return Promise.reject(new Error('invalid block tag or block hash'));

        case 'getTransaction':
            return this.send('eth_getTransactionByHash', [params.transactionHash]);

        case 'getTransactionReceipt':
            return this.send('eth_getTransactionReceipt', [params.transactionHash]);

        case 'call':
            return this.send('eth_call', [getTransaction(params.transaction), 'latest']);

        case 'estimateGas':
            return this.send('eth_estimateGas', [getTransaction(params.transaction)]);

        case 'getLogs':
            return this.send('eth_getLogs', [params.filter]);

        default:
            break;
    }

    return Promise.reject(new Error('not implemented - ' + method));
});

utils.defineProperty(JsonRpcProvider.prototype, '_startPending', function() {
    if (this._pendingFilter != null) { return; }
    var self = this;

    var pendingFilter = this.send('eth_newPendingTransactionFilter', []);
    this._pendingFilter = pendingFilter;

    pendingFilter.then(function(filterId) {
        function poll() {
            self.send('eth_getFilterChanges', [ filterId ]).then(function(hashes) {
                if (self._pendingFilter != pendingFilter) { return; }

                var seq = Promise.resolve();
                hashes.forEach(function(hash) {
                    seq = seq.then(function() {
                        return self.getTransaction(hash).then(function(tx) {
                            self.emit('pending', tx);
                        });
                    });
                });

                return seq.then(function() {
                    return timer(1000);
                });
            }).then(function() {
                if (self._pendingFilter != pendingFilter) {
                    self.send('eth_uninstallFilter', [ filterIf ]);
                    return;
                }
                setTimeout(function() { poll(); }, 0);
            });
        }
        poll();

        return filterId;
    });
});

utils.defineProperty(JsonRpcProvider.prototype, '_stopPending', function() {
    this._pendingFilter = null;
});

utils.defineProperty(JsonRpcProvider, '_hexlifyTransaction', function(transaction) {
    return getTransaction(transaction);
});

module.exports = JsonRpcProvider;
