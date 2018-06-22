'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var interface_1 = require("./interface");
var provider_1 = require("../providers/provider");
var wallet_1 = require("../wallet/wallet");
var address_1 = require("../utils/address");
var bytes_1 = require("../utils/bytes");
var bignumber_1 = require("../utils/bignumber");
var properties_1 = require("../utils/properties");
var errors = __importStar(require("../utils/errors"));
var allowedTransactionKeys = {
    data: true, from: true, gasLimit: true, gasPrice: true, nonce: true, to: true, value: true
};
// Recursively replaces ENS names with promises to resolve the name and
// stalls until all promises have returned
// @TODO: Expand this to resolve any promises too
function resolveAddresses(provider, value, paramType) {
    if (Array.isArray(paramType)) {
        var promises = [];
        paramType.forEach(function (paramType, index) {
            var v = null;
            if (Array.isArray(value)) {
                v = value[index];
            }
            else {
                v = value[paramType.name];
            }
            promises.push(resolveAddresses(provider, v, paramType));
        });
        return Promise.all(promises);
    }
    if (paramType.type === 'address') {
        return provider.resolveName(value);
    }
    if (paramType.components) {
        return resolveAddresses(provider, value, paramType.components);
    }
    return Promise.resolve(value);
}
function runMethod(contract, functionName, estimateOnly) {
    var method = contract.interface.functions[functionName];
    return function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var tx = {};
        // If 1 extra parameter was passed in, it contains overrides
        if (params.length === method.inputs.length + 1 && typeof (params[params.length - 1]) === 'object') {
            tx = properties_1.shallowCopy(params.pop());
            // Check for unexpected keys (e.g. using "gas" instead of "gasLimit")
            for (var key in tx) {
                if (!allowedTransactionKeys[key]) {
                    throw new Error('unknown transaction override ' + key);
                }
            }
        }
        if (params.length != method.inputs.length) {
            throw new Error('incorrect number of arguments');
        }
        // Check overrides make sense
        ['data', 'to'].forEach(function (key) {
            if (tx[key] != null) {
                errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key });
            }
        });
        // Send to the contract address
        tx.to = contract.addressPromise;
        return resolveAddresses(contract.provider, params, method.inputs).then(function (params) {
            tx.data = method.encode(params);
            if (method.type === 'call') {
                // Call (constant functions) always cost 0 ether
                if (estimateOnly) {
                    return Promise.resolve(bignumber_1.ConstantZero);
                }
                if (!contract.provider) {
                    errors.throwError('call (constant functions) require a provider or a signer with a provider', errors.UNSUPPORTED_OPERATION, { operation: 'call' });
                }
                // Check overrides make sense
                ['gasLimit', 'gasPrice', 'value'].forEach(function (key) {
                    if (tx[key] != null) {
                        throw new Error('call cannot override ' + key);
                    }
                });
                if (tx.from == null && contract.signer) {
                    tx.from = contract.signer.getAddress();
                }
                return contract.provider.call(tx).then(function (value) {
                    try {
                        var result = method.decode(value);
                        if (method.outputs.length === 1) {
                            result = result[0];
                        }
                        return result;
                    }
                    catch (error) {
                        if (value === '0x' && method.outputs.length > 0) {
                            errors.throwError('call exception', errors.CALL_EXCEPTION, {
                                address: contract.address,
                                method: method.signature,
                                value: params
                            });
                        }
                        throw error;
                    }
                });
            }
            else if (method.type === 'transaction') {
                // Only computing the transaction estimate
                if (estimateOnly) {
                    if (!contract.provider) {
                        errors.throwError('estimate gas require a provider or a signer with a provider', errors.UNSUPPORTED_OPERATION, { operation: 'estimateGas' });
                    }
                    if (tx.from == null && contract.signer) {
                        tx.from = contract.signer.getAddress();
                    }
                    return contract.provider.estimateGas(tx);
                }
                if (!contract.signer) {
                    errors.throwError('sending a transaction require a signer', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction' });
                }
                // Make sure they aren't overriding something they shouldn't
                if (tx.from != null) {
                    errors.throwError('cannot override from in a transaction', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction' });
                }
                return contract.signer.sendTransaction(tx);
            }
            throw new Error('invalid type - ' + method.type);
            return null;
        });
    };
}
var Contract = /** @class */ (function () {
    // https://github.com/Microsoft/TypeScript/issues/5453
    // Once this issue is resolved (there are open PR) we can do this nicer
    // by making addressOrName default to null for 2 operand calls. :)
    function Contract(addressOrName, contractInterface, signerOrProvider) {
        var _this = this;
        errors.checkNew(this, Contract);
        // @TODO: Maybe still check the addressOrName looks like a valid address or name?
        //address = getAddress(address);
        if (contractInterface instanceof interface_1.Interface) {
            properties_1.defineReadOnly(this, 'interface', contractInterface);
        }
        else {
            properties_1.defineReadOnly(this, 'interface', new interface_1.Interface(contractInterface));
        }
        if (signerOrProvider instanceof wallet_1.Signer) {
            properties_1.defineReadOnly(this, 'provider', signerOrProvider.provider);
            properties_1.defineReadOnly(this, 'signer', signerOrProvider);
        }
        else if (signerOrProvider instanceof provider_1.Provider) {
            properties_1.defineReadOnly(this, 'provider', signerOrProvider);
            properties_1.defineReadOnly(this, 'signer', null);
        }
        else {
            errors.throwError('invalid signer or provider', errors.INVALID_ARGUMENT, { arg: 'signerOrProvider', value: signerOrProvider });
        }
        properties_1.defineReadOnly(this, 'estimate', {});
        properties_1.defineReadOnly(this, 'events', {});
        properties_1.defineReadOnly(this, 'functions', {});
        // Not connected to an on-chain instance, so do not connect functions and events
        if (!addressOrName) {
            properties_1.defineReadOnly(this, 'address', null);
            properties_1.defineReadOnly(this, 'addressPromise', Promise.resolve(null));
            return;
        }
        properties_1.defineReadOnly(this, 'address', addressOrName);
        properties_1.defineReadOnly(this, 'addressPromise', this.provider.resolveName(addressOrName));
        Object.keys(this.interface.functions).forEach(function (name) {
            var run = runMethod(_this, name, false);
            if (_this[name] == null) {
                properties_1.defineReadOnly(_this, name, run);
            }
            else {
                console.log('WARNING: Multiple definitions for ' + name);
            }
            if (_this.functions[name] == null) {
                properties_1.defineReadOnly(_this.functions, name, run);
                properties_1.defineReadOnly(_this.estimate, name, runMethod(_this, name, true));
            }
        });
        Object.keys(this.interface.events).forEach(function (eventName) {
            var eventInfo = _this.interface.events[eventName];
            var eventCallback = null;
            var contract = _this;
            function handleEvent(log) {
                contract.addressPromise.then(function (address) {
                    // Not meant for us (the topics just has the same name)
                    if (address != log.address) {
                        return;
                    }
                    try {
                        var result = eventInfo.decode(log.data, log.topics);
                        // Some useful things to have with the log
                        log.args = result;
                        log.event = eventName;
                        log.parse = eventInfo.parse;
                        log.removeListener = function () {
                            contract.provider.removeListener([eventInfo.topic], handleEvent);
                        };
                        log.getBlock = function () { return contract.provider.getBlock(log.blockHash); ; };
                        log.getTransaction = function () { return contract.provider.getTransaction(log.transactionHash); };
                        log.getTransactionReceipt = function () { return contract.provider.getTransactionReceipt(log.transactionHash); };
                        log.eventSignature = eventInfo.signature;
                        eventCallback.apply(log, Array.prototype.slice.call(result));
                    }
                    catch (error) {
                        console.log(error);
                    }
                });
            }
            var property = {
                enumerable: true,
                get: function () {
                    return eventCallback;
                },
                set: function (value) {
                    if (!value) {
                        value = null;
                    }
                    if (!contract.provider) {
                        errors.throwError('events require a provider or a signer with a provider', errors.UNSUPPORTED_OPERATION, { operation: 'events' });
                    }
                    if (!value && eventCallback) {
                        contract.provider.removeListener([eventInfo.topic], handleEvent);
                    }
                    else if (value && !eventCallback) {
                        contract.provider.on([eventInfo.topic], handleEvent);
                    }
                    eventCallback = value;
                }
            };
            var propertyName = 'on' + eventName.toLowerCase();
            if (_this[propertyName] == null) {
                Object.defineProperty(_this, propertyName, property);
            }
            Object.defineProperty(_this.events, eventName, property);
        }, this);
    }
    Contract.prototype.fallback = function (overrides) {
        if (!this.signer) {
            errors.throwError('sending a transaction require a signer', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction(fallback)' });
        }
        var tx = properties_1.shallowCopy(overrides || {});
        ['from', 'to'].forEach(function (key) {
            if (tx.to == null) {
                return;
            }
            errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key });
        });
        tx.to = this.addressPromise;
        return this.signer.sendTransaction(tx);
    };
    Contract.prototype.callFallback = function (overrides) {
        if (!this.provider) {
            errors.throwError('call (constant functions) require a provider or a signer with a provider', errors.UNSUPPORTED_OPERATION, { operation: 'call(fallback)' });
        }
        var tx = properties_1.shallowCopy(overrides || {});
        ['to', 'value'].forEach(function (key) {
            if (tx.to == null) {
                return;
            }
            errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key });
        });
        tx.to = this.addressPromise;
        return this.provider.call(tx);
    };
    // Reconnect to a different signer or provider
    Contract.prototype.connect = function (signerOrProvider) {
        return new Contract(this.address, this.interface, signerOrProvider);
    };
    // Deploy the contract with the bytecode, resolving to the deployed address.
    // Use contract.deployTransaction.wait() to wait until the contract has
    // been mined.
    Contract.prototype.deploy = function (bytecode) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.signer == null) {
            throw new Error('missing signer'); // @TODO: errors.throwError
        }
        // A lot of common tools do not prefix bytecode with a 0x
        if (typeof (bytecode) === 'string' && bytecode.match(/^[0-9a-f]*$/i) && (bytecode.length % 2) == 0) {
            bytecode = '0x' + bytecode;
        }
        if (!bytes_1.isHexString(bytecode)) {
            errors.throwError('bytecode must be a valid hex string', errors.INVALID_ARGUMENT, { arg: 'bytecode', value: bytecode });
        }
        if ((bytecode.length % 2) !== 0) {
            errors.throwError('bytecode must be valid data (even length)', errors.INVALID_ARGUMENT, { arg: 'bytecode', value: bytecode });
        }
        // @TODO: overrides of args.length = this.interface.deployFunction.inputs.length + 1
        return this.signer.sendTransaction({
            data: this.interface.deployFunction.encode(bytecode, args)
        }).then(function (tx) {
            var contract = new Contract(address_1.getContractAddress(tx), _this.interface, _this.signer || _this.provider);
            properties_1.defineReadOnly(contract, 'deployTransaction', tx);
            return contract;
        });
    };
    return Contract;
}());
exports.Contract = Contract;
