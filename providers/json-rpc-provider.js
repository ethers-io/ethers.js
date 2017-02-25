'use strict';

// See: https://github.com/ethereum/wiki/wiki/JSON-RPC

var inherits = require('inherits');

var Provider = require('./provider.js');

var utils = (function() {
    return {
        defineProperty: require('ethers-utils/properties.js').defineProperty,

        hexlify: require('ethers-utils/convert.js').hexlify,
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
    var result = [];
    for (var key in transaction) {
        result[key] = utils.hexlify(transaction[key]);
    }
    return result;
}

function JsonRpcProvider(url, testnet, chainId) {
    if (!(this instanceof JsonRpcProvider)) { throw new Error('missing new'); }

    Provider.call(this, testnet, chainId);

    utils.defineProperty(this, 'url', url);
}
inherits(JsonRpcProvider, Provider);

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
            return this.send('eth_call', [getTransaction(params.transaction)]);

        case 'estimateGas':
            return this.send('eth_estimateGas', [getTransaction(params.transaction)]);

        case 'getLogs':
            console.log('FFF', params.filter);
            return this.send('eth_getLogs', [params.filter]);

        default:
            break;
    }

    return Promise.reject(new Error('not implemented - ' + method));
});

module.exports = JsonRpcProvider;

/*

// Manages JSON-RPC to an Ethereum node
function Web3Connector(provider) {
    if (!(this instanceof Web3Connector)) { throw new Error('missing new'); }

    var nextMessageId = 1;
    utils.defineProperty(this, 'sendMessage', function(method, params) {
        return new Promise(function(resolve, reject) {
            provider.sendAsync({
                id: (nextMessageId++),
                jsonrpc: '2.0',
                method: method,
                params: params
            }, function(error, result) {
                if (error) {
                    reject(error);
                } else {
                    if (result.error) {
                        var error = new Error(result.error.message);
                        error.code = result.error.code;
                        error.data = result.error.data;
                        reject(error);
                    } else {
                        resolve(result.result);
                    }
                }
            });
        });
    });
}

// Mimics Web3 interface
function rpcSendAsync(url) {
    return {
        sendAsync: function(payload, callback) {

            var request = new XMLHttpRequest();
            request.open('POST', url, true);
            request.setRequestHeader('Content-Type','application/json');
            request.onreadystatechange = function() {
                if (request.readyState !== 4) { return; }

                if (typeof(callback) !== 'function') { return; }

                var result = request.responseText;
                try {
                    callback(null, JSON.parse(result));
                } catch (error) {
                    var responseError = new Error('invalid response');
                    responseError.orginialError = error;
                    responseError.data = result;
                    callback(responseError);
                }
            };

            try {
                request.send(JSON.stringify(payload));
            } catch (error) {
                var connectionError = new Error('connection error');
                connectionError.error = error;
                callback(connectionError);
            }
        }
    }
}

function SendAsyncProvider(sendAsync) {
    if (!(this instanceof SendAsyncProvider)) { throw new Error('missing new'); }
    utils.defineProperty(this, 'client', new Web3Connector(sendAsync));
}


function validBlock(value) {
    if (value == null) { return 'latest'; }
    if (value === 'latest' || value === 'pending') { return value; }

    if (typeof(value) === 'number' && value == parseInt(value)) {
        return parseInt(value);
    }

    throw new Error('invalid blockNumber');
}

function postProcess(client, method, params, makeBN) {
    return new Promise(function(resolve, reject) {
        client.sendMessage(method, params).then(function (result) {
            if (!utils.isHexString(result)) {
                reject(new Error('invalid server response'));
            } else {
                result = result.substring(2);
                if (makeBN) {
                    result = new utils.BN(result, 16);
                } else {
                    result = parseInt(result, 16);
                }
                resolve(result);
            }
        }, function(error) {
            reject(error);
        });
    });
}

utils.defineProperty(SendAsyncProvider.prototype, 'getBalance', function(address, blockNumber) {
    return postProcess(this.client, 'eth_getBalance', [
        utils.getAddress(address),
        validBlock(blockNumber)
    ], true);
});

utils.defineProperty(SendAsyncProvider.prototype, 'getTransactionCount', function(address, blockNumber) {
    return postProcess(this.client, 'eth_getTransactionCount', [
        utils.getAddress(address),
        validBlock(blockNumber)
    ], false);
});

utils.defineProperty(SendAsyncProvider.prototype, 'getGasPrice', function() {
    return postProcess(this.client, 'eth_gasPrice', [], true);
});

utils.defineProperty(SendAsyncProvider.prototype, 'sendTransaction', function(signedTransaction) {
    if (!utils.isHexString(signedTransaction)) { throw new Error('invalid transaction'); }
    return this.client.sendMessage('eth_sendRawTransaction', [signedTransaction]);
});

utils.defineProperty(SendAsyncProvider.prototype, 'call', function(transaction) {
    // @TODO: check validTransaction?
    // @TODO: allow passing in block tag?
    return this.client.sendMessage('eth_call', [transaction, 'latest']);
});

utils.defineProperty(SendAsyncProvider.prototype, 'estimateGas', function(transaction) {
    // @TODO: check validTransaction?
    return postProcess(this.client, 'eth_estimateGas', [transaction], true);
});


var providers = {};


function HttpProvider(url) {
    if (!(this instanceof HttpProvider)) { throw new Error('missing new'); }
    SendAsyncProvider.call(this, rpcSendAsync(url));
}
inherits(HttpProvider, SendAsyncProvider);
utils.defineProperty(providers, 'HttpProvider', HttpProvider);


function Web3Provider(provider) {
    if (!(this instanceof Web3Provider)) { throw new Error('missing new'); }
    if (provider.currentProvider) { provider = provider.currentProvider; }
    if (!provider.sendAsync) { throw new Error('invalid provider'); }
    SendAsyncProvider.call(this, provider);
}
inherits(Web3Provider, SendAsyncProvider);
utils.defineProperty(providers, 'Web3Provider', Web3Provider);


function base10ToBN(value) {
    return new utils.BN(value);
}

function hexToBN(value) {
    return new utils.BN(ensureHex(value).substring(2), 16);
}

function hexToNumber(value) {
    if (!utils.isHexString(value)) { throw new Error('invalid hex string'); }
    return parseInt(value.substring(2), 16);
}

function ensureHex(value) {
    if (!utils.isHexString(value)) { throw new Error('invalid hex string'); }
    return value;
}

function ensureTxid(value) {
    if (!utils.isHexString(value, 32)) { throw new Error('invalid hex string'); }
    return value;
}

function getGasPrice(value) {
    if (!value || !value.transactions || value.transactions.length === 0) {
        throw new Error('invalid response');
    }
    return hexToBN(value.transactions[0].gasPrice);
}

function EtherscanProvider(options) {
    if (!(this instanceof EtherscanProvider)) { throw new Error('missing new'); }
    if (!options) { options = {}; }

    var testnet = options.testnet;
    var apiKey = options.apiKey;

    utils.defineProperty(this, 'testnet', testnet);
    utils.defineProperty(this, 'apiKey', apiKey);

    utils.defineProperty(this, '_send', function(query, check) {
        var url = (testnet ? 'https://testnet.etherscan.io/api?': 'https://api.etherscan.io/api?');
        url += query;
        if (apiKey) { url += 'apikey=' + apiKey; }
        //console.log('URL', url);

        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.onreadystatechange = function() {
                if (request.readyState !== 4) { return; }

                var result = request.responseText;
                //console.log(result);
                try {
                    result = JSON.parse(result);
                    if (result.message) {
                        if (result.message === 'OK') {
                            resolve(check(result.result));
                        } else {
                            reject(new Error('invalid response'));
                        }
                    } else {
                        if (result.error) {
                            console.log(result.error);
                            reject(new Error('invalid response'));
                        } else {
                            resolve(check(result.result));
                        }
                    }
                } catch (error) {
                    console.log(error);
                    reject(new Error('invalid response'));
                }
            }

            try {
                request.send();
            } catch (error) {
                var connectionError = new Error('connection error');
                connectionError.error = error;
                reject(connectionError);
            }
        });

    });
}
utils.defineProperty(providers, 'EtherscanProvider', EtherscanProvider);

utils.defineProperty(EtherscanProvider.prototype, 'getBalance', function(address, blockNumber) {
    address = utils.getAddress(address);
    blockNumber = validBlock(blockNumber);
    var query = ('module=account&action=balance&address=' + address + '&tag=' + blockNumber);
    return this._send(query, base10ToBN);
});

utils.defineProperty(EtherscanProvider.prototype, 'getTransactionCount', function(address, blockNumber) {
    address = utils.getAddress(address);
    blockNumber = validBlock(blockNumber);
    var query = ('module=proxy&action=eth_getTransactionCount&address=' + address + '&tag=' + blockNumber);
    return this._send(query, hexToNumber);
});

utils.defineProperty(EtherscanProvider.prototype, 'getGasPrice', function() {
    var query = ('module=proxy&action=eth_gasPrice');
    return this._send(query, hexToBN);
});

utils.defineProperty(EtherscanProvider.prototype, 'sendTransaction', function(signedTransaction) {
    if (!utils.isHexString(signedTransaction)) { throw new Error('invalid transaction'); }
    var query = ('module=proxy&action=eth_sendRawTransaction&hex=' + signedTransaction);
    return this._send(query, ensureTxid);
});

utils.defineProperty(EtherscanProvider.prototype, 'call', function(transaction) {
    var address = utils.getAddress(transaction.to);
    var data = transaction.data;
    if (!utils.isHexString(data)) { throw new Error('invalid data'); }
    var query = ('module=proxy&action=eth_call&to=' + address + '&data=' + data);
    return this._send(query, ensureHex);
});

utils.defineProperty(EtherscanProvider.prototype, 'estimateGas', function(transaction) {
    var address = utils.getAddress(transaction.to);

    var query = 'module=proxy&action=eth_estimateGas&to=' + address;
    if (transaction.gasPrice) {
        query += '&gasPrice=' + utils.hexlify(transaction.gasPrice);
    }
    if (transaction.gasLimit) {
        query += '&gas=' + utils.hexlify(transaction.gasLimit);
    }
    if (transaction.from) {
        query += '&from=' + utils.getAddress(transaction.from);
    }
    if (transaction.data) {
        query += '&data=' + ensureHex(transaction.data);
    }
    if (transaction.value) {
        query += '&value=' + utils.hexlify(transaction.value);
    }
    return this._send(query, hexToBN);
});


utils.defineProperty(providers, 'isProvider', function(provider) {
    if (!provider) { return false; }
    for (var i = 0; i < methods; i++) {
        if (typeof(provider[methods[i]]) !== 'function') {
            return false;
        }
    }
    return true;
});

module.exports = providers;
*/
