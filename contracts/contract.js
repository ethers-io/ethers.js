'use strict';

var utils = (function() {
    return {
        defineProperty: require('ethers-utils/properties.js').defineProperty,

        bigNumberify: require('ethers-utils/bignumber.js').bigNumberify,

        hexlify: require('ethers-utils/convert.js').hexlify,
    };
})();

var allowedTransactionKeys = {
    data: true, from: true, gasLimit: true, gasPrice:true, to: true, value: true
}

function Contract(wallet, contractAddress, contractInterface) {
    utils.defineProperty(this, 'wallet', wallet);

    utils.defineProperty(this, 'contractAddress', contractAddress);
    utils.defineProperty(this, 'interface', contractInterface);

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
/*
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
*/
    }
    function runMethod(method, estimateOnly) {
        return function() {
            var provider = wallet._provider;

            var transaction = {}

            var params = Array.prototype.slice.call(arguments);
            if (params.length == contractInterface[method].inputs.length + 1) {
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


            var call = contractInterface[method].apply(contractInterface, params);
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

                    if (estimateOnly) {
                        return new Promise(function(resolve, reject) {
                            resolve(new utils.bigNumberify(0));
                        });
                    }

                    return new Promise(function(resolve, reject) {
                        provider.call(transaction).then(function(value) {
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

                    if (estimateOnly) {
                        return new Promise(function(resolve, reject) {
                            provider.estimateGas(transaction).then(function(gasEstimate) {
                                resolve(gasEstimate);
                            }, function(error) {
                                reject(error);
                            });
                        });
                    }

                    return new Promise(function(resolve, reject) {
                        Promise.all([
                            provider.getTransactionCount(wallet.address, 'pending'),
                            provider.getGasPrice(),
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
                            provider.sendTransaction(signedTransaction).then(function(txid) {
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

    var estimate = {};
    utils.defineProperty(this, 'estimate', estimate);

    contractInterface.methods.forEach(function(method) {
        utils.defineProperty(this, method, runMethod(method, false));
        utils.defineProperty(estimate, method, runMethod(method, true));
    }, this);

    contractInterface.events.forEach(function(method) {
        var call = contractInterface[method].apply(contractInterface, []);
        Object.defineProperty(self, 'on' + call.name.toLowerCase(), {
            enumerable: true,
            get: function() {
                var info = filters[call.name];
                if (!info || !info[call.name]) { return null; }
                return info.callback;
            },
            set: function(value) {
                setupFilter(call, value);
            }
        });
    }, this);
}

module.exports = Contract;
