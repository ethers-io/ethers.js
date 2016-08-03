'use strict';

var utils = require('./utils.js');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;


function Web3Connector(provider) {
    if (!(this instanceof Web3Connector)) { throw new Error('missing new'); }

    var nextMessageId = 1;
    utils.defineProperty(this, 'sendMessage', function(method, params) {
    //console.log('mm', method, params);
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
                    callback(new Error('invalid response'));
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


function Provider(provider) {
    if (!(this instanceof Provider)) { throw new Error('missing new'); }

    var client = null;

    if (typeof(provider) === 'string') {

        // An RPC URL
        if (provider.substring(0, 7) === 'http://') {
            client = new Web3Connector(rpcSendAsync(provider));

        // An ethers.io URL
        } else if (provider.substring(0, 5) === 'ws://' || provider.substirng(0, 6) === 'wss://') {
            //client =

        // Etherscan
        } else if (string === 'testnet.etherscan.io' || string === 'etherscan.io') {
            // client =
        }

    // A Web3 Instance
    } else if (provider.currentProvider && provider.currentProvider.sendAsync) {
        client = new Web3Connector(provider.currentProvider);

    // A Web3 Provider
    } else if (provider.sendAsync) {
        client = new Web3Connector(provider);
    }

    if (!client) { throw new Error('invalid connector'); }

    utils.defineProperty(this, 'client', client);
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

utils.defineProperty(Provider.prototype, 'getBalance', function(address, blockNumber) {
    return postProcess(this.client, 'eth_getBalance', [address, validBlock(blockNumber)], true);
});

utils.defineProperty(Provider.prototype, 'getTransactionCount', function(address, blockNumber) {
    return postProcess(this.client, 'eth_getTransactionCount', [address, validBlock(blockNumber)], false);
});

utils.defineProperty(Provider.prototype, 'getGasPrice', function() {
    return postProcess(this.client, 'eth_gasPrice', [], true);
});

utils.defineProperty(Provider.prototype, 'sendTransaction', function(signedTransaction) {
    return this.client.sendMessage('eth_sendRawTransaction', [signedTransaction]);
});

utils.defineProperty(Provider.prototype, 'call', function(transaction) {
    return this.client.sendMessage('eth_call', [transaction]);
});

utils.defineProperty(Provider.prototype, 'estimateGas', function(transaction) {
    return postProcess(this.client, 'eth_estimateGas', [transaction], true);
});


module.exports = Provider;
