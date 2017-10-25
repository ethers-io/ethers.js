'use strict';

// See: https://github.com/ethereum/wiki/wiki/JSON-RPC

var Provider = require('./provider.js');

var utils = (function() {
    var convert = require('ethers-utils/convert');
    return {
        defineProperty: require('ethers-utils/properties').defineProperty,

        hexlify: convert.hexlify,
        isHexString: convert.isHexString,
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

function stripHexZeros(value) {
    while (value.length > 3 && value.substring(0, 3) === '0x0') {
        value = '0x' + value.substring(3);
    }
    return value;
}

function getTransaction(transaction) {
    var result = {};

    for (var key in transaction) {
        result[key] = utils.hexlify(transaction[key]);
    }

    // Some nodes (INFURA ropsten; INFURA mainnet is fine) don't like extra zeros.
    ['gasLimit', 'gasPrice', 'nonce', 'value'].forEach(function(key) {
        if (!result[key]) { return; }
        result[key] = stripHexZeros(result[key]);
    });

    return result;
}

function JsonRpcProvider(url, network) {
    if (!(this instanceof JsonRpcProvider)) { throw new Error('missing new'); }

    network = Provider._legacyConstructor(network, arguments.length - 1, arguments[1], arguments[2]);

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
            var blockTag = params.blockTag;
            if (utils.isHexString(blockTag)) { blockTag = stripHexZeros(blockTag); }
            return this.send('eth_getBalance', [params.address, blockTag]);

        case 'getTransactionCount':
            var blockTag = params.blockTag;
            if (utils.isHexString(blockTag)) { blockTag = stripHexZeros(blockTag); }
            return this.send('eth_getTransactionCount', [params.address, blockTag]);

        case 'getCode':
            var blockTag = params.blockTag;
            if (utils.isHexString(blockTag)) { blockTag = stripHexZeros(blockTag); }
            return this.send('eth_getCode', [params.address, blockTag]);

        case 'getStorageAt':
            var position = params.position;
            if (utils.isHexString(position)) { position = stripHexZeros(position); }
            var blockTag = params.blockTag;
            if (utils.isHexString(blockTag)) { blockTag = stripHexZeros(blockTag); }
            return this.send('eth_getStorageAt', [params.address, position, blockTag]);

        case 'sendTransaction':
            return this.send('eth_sendRawTransaction', [params.signedTransaction]);

        case 'getBlock':
            if (params.blockTag) {
                var blockTag = params.blockTag;
                if (utils.isHexString(blockTag)) { blockTag = stripHexZeros(blockTag); }
                return this.send('eth_getBlockByNumber', [blockTag, false]);
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
