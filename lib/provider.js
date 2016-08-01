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
            //console.log(error, result);
                if (error) {
                    reject(error);
                } else {
                    if (result.code) {
                        var error = new Error(result.message);
                        error.code = result.code;
                        error.data = result.data;
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


module.exports = Provider;
