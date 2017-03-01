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

function Contract(address, contractInterface, signerOrProvider) {
    if (!(this instanceof Contract)) { throw new Error('missing new'); }

    address = utils.getAddress(address);

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

    utils.defineProperty(this, 'address', address);
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
                for (var key in transaction) {
                    if (!allowedTransactionKeys[key]) {
                        throw new Error('unknown transaction override ' + key);
                    }
                }
            }


            var call = method.apply(contractInterface, params);
            switch (call.type) {
                case 'call':

                    // Call (constant functions) always cost 0 ether
                    if (estimateOnly) {
                        return Promise.resolve(new utils.bigNumberify(0));
                    }

                    // Check overrides make sense
                    ['data', 'gasLimit', 'gasPrice', 'to', 'value'].forEach(function(key) {
                        if (transaction[key] != null) {
                            throw new Error('call cannot override ' + key) ;
                        }
                    });

                    transaction.data = call.data;

                    var fromPromise = null;
                    if (transaction.from == null && signer) {
                        fromPromise = new Promise(function(resolve, reject) {
                            var address = signer.address;
                            if (address instanceof Promise) { return address; }
                            resolve(address);
                        });
                    } else {
                        fromPromise = Promise.resolve(null);
                    }

                    transaction.to = address;

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

                    ['data', 'from', 'to'].forEach(function(key) {
                        if (transaction[key] != null) {
                            throw new Error('transaction cannot override ' + key) ;
                        }
                    });

                    transaction.data = call.data;

                    transaction.to = address;

                    if (estimateOnly) {
                        return provider.estimateGas(transaction)
                    }

                    if (transaction.gasLimit == null) {
                        transaction.gasLimit = signer.defaultGasRate || 2000000;
                    }

                    var gasPricePromise = null;
                    var noncePromise = null;
                    if (transaction.nonce) {
                        noncePromise = Promise.resolve(transaction.nonce)
                    } else {
                        noncePromise = provider.getTransactionCount(signer.address, 'pending');
                    }

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

    var execute = {};
    utils.defineProperty(this, 'execute', execute);

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

        if (execute[method] == null) {
            utils.defineProperty(execute, methodName, run);
            utils.defineProperty(estimate, methodName, runMethod(method, true));
        }
    }, this);

    Object.keys(contractInterface.events).forEach(function(eventName) {
        var eventInfo = contractInterface.events[eventName]();

        var eventCallback = null;

        function handleEvent(log) {
            try {
                var result = eventInfo.parse(log.data);
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
    if (typeof(contractInterface) === 'string') {
        contractInterface = new Interface(contractInterface);
    }

    var args = Array.prototype.slice.call(arguments);
    args.splice(1, 1);

    return {
        data: contractInterface.deployFunction.apply(contractInterface, args).bytecode
    }
});

module.exports = Contract;
