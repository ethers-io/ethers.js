'use strict';

var Interface = require('./interface.js');

var utils = (function() {
    return {
        defineProperty: require('ethers-utils/properties.js').defineProperty,

        getAddress: require('ethers-utils/address.js').getAddress,

        bigNumberify: require('ethers-utils/bignumber.js').bigNumberify,

        hexlify: require('ethers-utils/convert.js').hexlify,
    };
})();

var allowedTransactionKeys = {
    data: true, from: true, gasLimit: true, gasPrice:true, to: true, value: true
}

function Contract(addressOrName, contractInterface, signerOrProvider) {
    if (!(this instanceof Contract)) { throw new Error('missing new'); }

    // @TODO: Maybe still check the addressOrName looks like a valid address or name?
    //address = utils.getAddress(address);

    if (!(contractInterface instanceof Interface)) {
        contractInterface = new Interface(contractInterface);
    }

    var signer = signerOrProvider;
    var provider = null;
    if (signerOrProvider.provider) {
        provider = signerOrProvider.provider;
    } else if (signerOrProvider) {
        provider = signerOrProvider;
        signer = null;
    } else {
        throw new Error('missing provider');
    }

    utils.defineProperty(this, 'address', addressOrName);
    utils.defineProperty(this, 'interface', contractInterface);
    utils.defineProperty(this, 'signer', signer);
    utils.defineProperty(this, 'provider', provider);

    function runMethod(method, estimateOnly) {
        return function() {
            var transaction = {}

            var params = Array.prototype.slice.call(arguments);

            // If 1 extra parameter was passed in, it contains overrides
            if (params.length == method.inputs.length + 1) {
                transaction = params.pop();
                if (typeof(transaction) !== 'object') {
                    throw new Error('invalid transaction overrides');
                }

                // Check for unexpected keys (e.g. using "gas" instead of "gasLimit")
                for (var key in transaction) {
                    if (!allowedTransactionKeys[key]) {
                        throw new Error('unknown transaction override ' + key);
                    }
                }
            }

            // Check overrides make sense
            ['data', 'to'].forEach(function(key) {
                if (transaction[key] != null) {
                    throw new Error('cannot override ' + key) ;
                }
            });

            var call = method.apply(contractInterface, params);

            // Send to the contract address
            transaction.to = addressOrName;

            // Set the transaction data
            transaction.data = call.data;

            switch (call.type) {
                case 'call':

                    // Call (constant functions) always cost 0 ether
                    if (estimateOnly) {
                        return Promise.resolve(new utils.bigNumberify(0));
                    }

                    // Check overrides make sense
                    ['gasLimit', 'gasPrice', 'value'].forEach(function(key) {
                        if (transaction[key] != null) {
                            throw new Error('call cannot override ' + key) ;
                        }
                    });

                    var fromPromise = null;
                    if (transaction.from == null && signer && signer.getAddress) {
                        fromPromise = signer.getAddress();
                        if (!(fromPromise instanceof Promise)) {
                            fromPromise = Promise.resolve(fromPromise);
                        }
                    } else {
                        fromPromise = Promise.resolve(null);
                    }

                    return fromPromise.then(function(address) {
                        if (address) {
                            transaction.from = utils.getAddress(address);
                        }
                        return provider.call(transaction);

                    }).then(function(value) {
                        return call.parse(value);
                    });

                case 'transaction':
                    if (!signer) { return Promise.reject(new Error('missing signer')); }

                    // Make sure they aren't overriding something they shouldn't
                    if (transaction.from != null) {
                        throw new Error('transaction cannot override from') ;
                    }

                    // Only computing the transaction estimate
                    if (estimateOnly) {
                        if (signer && signer.estimateGas) {
                            return signer.estimateGas(transaction);
                        }

                        return provider.estimateGas(transaction)
                    }

                    // If the signer supports sendTrasaction, use it
                    if (signer.sendTransaction) {
                        return signer.sendTransaction(transaction);
                    }

                    if (!signer.sign) {
                        return Promise.reject(new Error('custom signer does not support signing'));
                    }

                    if (transaction.gasLimit == null) {
                        transaction.gasLimit = signer.defaultGasLimit || 2000000;
                    }

                    var noncePromise = null;
                    if (transaction.nonce) {
                        noncePromise = Promise.resolve(transaction.nonce)
                    } else if (signer.getTransactionCount) {
                        noncePromise = signer.getTransactionCount;
                        if (!(noncePromise instanceof Promise)) {
                            noncePromise = Promise.resolve(noncePromise);
                        }
                    } else {
                        var addressPromise = signer.getAddress();
                        if (!(addressPromise instanceof Promise)) {
                            addressPromise = Promise.resolve(addressPromise);
                        }
                        noncePromise = addressPromise.then(function(address) {
                            return provider.getTransactionCount(address, 'pending');
                        });
                    }

                    var gasPricePromise = null;
                    if (transaction.gasPrice) {
                        gasPricePromise = Promise.resolve(transaction.gasPrice);
                    } else {
                        gasPricePromise = provider.getGasPrice();
                    }

                    return Promise.all([
                        noncePromise,
                        gasPricePromise

                    ]).then(function(results) {
                        transaction.nonce = results[0];
                        transaction.gasPrice = results[1];
                        return signer.sign(transaction);

                    }).then(function(signedTransaction) {
                        return provider.sendTransaction(signedTransaction);
                    });
            }
        };
    }

    var estimate = {};
    utils.defineProperty(this, 'estimate', estimate);

    var functions = {};
    utils.defineProperty(this, 'functions', functions);

    var events = {};
    utils.defineProperty(this, 'events', events);

    Object.keys(contractInterface.functions).forEach(function(methodName) {
        var method = contractInterface.functions[methodName];

        var run = runMethod(method, false);

        if (this[methodName] == null) {
            utils.defineProperty(this, methodName, run);
        } else {
            console.log('WARNING: Multiple definitions for ' + method);
        }

        if (functions[method] == null) {
            utils.defineProperty(functions, methodName, run);
            utils.defineProperty(estimate, methodName, runMethod(method, true));
        }
    }, this);

    Object.keys(contractInterface.events).forEach(function(eventName) {
        var eventInfo = contractInterface.events[eventName]();

        var eventCallback = null;

        function handleEvent(log) {
            try {
                var result = eventInfo.parse(log.topics, log.data);
                eventCallback.apply(log, Array.prototype.slice.call(result));
            } catch (error) {
                console.log(error);
            }
        }

        var property = {
            enumerable: true,
            get: function() {
                return eventCallback;
            },
            set: function(value) {
                if (!value) { value = null; }

                if (!value && eventCallback) {
                    provider.removeListener(eventInfo.topics, handleEvent);

                } else if (value && !eventCallback) {
                    provider.on(eventInfo.topics, handleEvent);
                }

                eventCallback = value;
            }
        };

        var propertyName = 'on' + eventName.toLowerCase();
        if (this[propertyName] == null) {
            Object.defineProperty(this, propertyName, property);
        }

        Object.defineProperty(events, eventName, property);

    }, this);
}

utils.defineProperty(Contract, 'getDeployTransaction', function(bytecode, contractInterface) {

    if (!(contractInterface instanceof Interface)) {
        contractInterface = new Interface(contractInterface);
    }

    var args = Array.prototype.slice.call(arguments);
    args.splice(1, 1);

    return {
        data: contractInterface.deployFunction.apply(contractInterface, args).bytecode
    }
});

module.exports = Contract;
