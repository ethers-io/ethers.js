'use strict';

// See: https://github.com/ethereum/wiki/wiki/JSON-RPC

var Provider = require('./provider.js');

var utils = (function() {
    return {
        defineProperty: require('ethers-utils/properties').defineProperty,

        hexlify: require('ethers-utils/convert').hexlify,
    }
})();

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
    return result;
}

function JsonRpcProvider(url, testnet, chainId) {
    if (!(this instanceof JsonRpcProvider)) { throw new Error('missing new'); }

    Provider.call(this, testnet, chainId);

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

module.exports = JsonRpcProvider;
