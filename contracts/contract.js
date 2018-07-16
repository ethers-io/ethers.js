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
var abi_coder_1 = require("../utils/abi-coder");
var address_1 = require("../utils/address");
var bignumber_1 = require("../utils/bignumber");
var bytes_1 = require("../utils/bytes");
var properties_1 = require("../utils/properties");
var web_1 = require("../utils/web");
var types_1 = require("../utils/types");
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
                    if ((bytes_1.hexDataLength(value) % 32) === 4 && bytes_1.hexDataSlice(value, 0, 4) === '0x08c379a0') {
                        var reason = abi_coder_1.defaultAbiCoder.decode(['string'], bytes_1.hexDataSlice(value, 4));
                        errors.throwError('call revert exception', errors.CALL_EXCEPTION, {
                            address: contract.address,
                            args: params,
                            method: method.signature,
                            errorSignature: 'Error(string)',
                            errorArgs: [reason],
                            reason: reason,
                            transaction: tx
                        });
                    }
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
                                args: params
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
function getEventTag(filter) {
    return (filter.address || '') + (filter.topics ? filter.topics.join(':') : '');
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
        if (signerOrProvider instanceof types_1.Signer) {
            properties_1.defineReadOnly(this, 'provider', signerOrProvider.provider);
            properties_1.defineReadOnly(this, 'signer', signerOrProvider);
        }
        else if (signerOrProvider instanceof types_1.MinimalProvider) {
            properties_1.defineReadOnly(this, 'provider', signerOrProvider);
            properties_1.defineReadOnly(this, 'signer', null);
        }
        else {
            errors.throwError('invalid signer or provider', errors.INVALID_ARGUMENT, { arg: 'signerOrProvider', value: signerOrProvider });
        }
        properties_1.defineReadOnly(this, 'estimate', {});
        properties_1.defineReadOnly(this, 'functions', {});
        properties_1.defineReadOnly(this, 'filters', {});
        Object.keys(this.interface.events).forEach(function (eventName) {
            var event = _this.interface.events[eventName];
            properties_1.defineReadOnly(_this.filters, eventName, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return {
                    address: _this.address,
                    topics: event.encodeTopics(args)
                };
            });
        });
        // Not connected to an on-chain instance, so do not connect functions and events
        if (!addressOrName) {
            properties_1.defineReadOnly(this, 'address', null);
            properties_1.defineReadOnly(this, 'addressPromise', Promise.resolve(null));
            return;
        }
        this._events = [];
        properties_1.defineReadOnly(this, 'address', addressOrName);
        if (this.provider) {
            properties_1.defineReadOnly(this, 'addressPromise', this.provider.resolveName(addressOrName).then(function (address) {
                if (address == null) {
                    throw new Error('name not found');
                }
                return address;
            }).catch(function (error) {
                console.log('ERROR: Cannot find Contract - ' + addressOrName);
                throw error;
            }));
        }
        else {
            try {
                properties_1.defineReadOnly(this, 'addressPromise', Promise.resolve(address_1.getAddress(addressOrName)));
            }
            catch (error) {
                errors.throwError('provider is required to use non-address contract address', errors.INVALID_ARGUMENT, { argument: 'addressOrName', value: addressOrName });
            }
        }
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
    }
    // @TODO: Allow timeout?
    Contract.prototype.deployed = function () {
        var _this = this;
        // If we were just deployed, we know the transaction we should occur in
        if (this.deployTransaction) {
            return this.deployTransaction.wait().then(function () {
                return _this;
            });
        }
        // Otherwise, poll for our code to be deployed
        return web_1.poll(function () {
            return _this.provider.getCode(_this.address).then(function (code) {
                if (code === '0x') {
                    return undefined;
                }
                return _this;
            });
        }, { onceBlock: this.provider });
    };
    // @TODO:
    // estimateFallback(overrides?: TransactionRequest): Promise<BigNumber>
    // @TODO:
    // estimateDeploy(bytecode: string, ...args): Promise<BigNumber>
    Contract.prototype.fallback = function (overrides) {
        if (!this.signer) {
            errors.throwError('sending a transaction require a signer', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction(fallback)' });
        }
        var tx = properties_1.shallowCopy(overrides || {});
        ['from', 'to'].forEach(function (key) {
            if (tx[key] == null) {
                return;
            }
            errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key });
        });
        tx.to = this.addressPromise;
        return this.signer.sendTransaction(tx);
    };
    // Reconnect to a different signer or provider
    Contract.prototype.connect = function (signerOrProvider) {
        return new Contract(this.address, this.interface, signerOrProvider);
    };
    // Re-attach to a different on=chain instance of this contract
    Contract.prototype.attach = function (addressOrName) {
        return new Contract(addressOrName, this.interface, this.signer || this.provider);
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
        var tx = {};
        if (args.length === this.interface.deployFunction.inputs.length + 1) {
            tx = properties_1.shallowCopy(args.pop());
            for (var key in tx) {
                if (!allowedTransactionKeys[key]) {
                    throw new Error('unknown transaction override ' + key);
                }
            }
        }
        ['data', 'from', 'to'].forEach(function (key) {
            if (tx[key] == null) {
                return;
            }
            errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key });
        });
        tx.data = this.interface.deployFunction.encode(bytecode, args);
        errors.checkArgumentCount(args.length, this.interface.deployFunction.inputs.length, 'in Contract constructor');
        // @TODO: overrides of args.length = this.interface.deployFunction.inputs.length + 1
        return this.signer.sendTransaction(tx).then(function (tx) {
            var contract = new Contract(address_1.getContractAddress(tx), _this.interface, _this.signer || _this.provider);
            properties_1.defineReadOnly(contract, 'deployTransaction', tx);
            return contract;
        });
    };
    Contract.prototype._getEventFilter = function (eventName) {
        var _this = this;
        if (typeof (eventName) === 'string') {
            // Listen for any event
            if (eventName === '*') {
                return {
                    decode: function (log) {
                        return [_this.interface.parseLog(log)];
                    },
                    eventTag: '*',
                    filter: { address: this.address },
                };
            }
            // Normalize the eventName
            if (eventName.indexOf('(') !== -1) {
                eventName = abi_coder_1.formatSignature(abi_coder_1.parseSignature('event ' + eventName));
            }
            var event_1 = this.interface.events[eventName];
            if (!event_1) {
                errors.throwError('unknown event - ' + eventName, errors.INVALID_ARGUMENT, { argumnet: 'eventName', value: eventName });
            }
            var filter_1 = {
                address: this.address,
                topics: [event_1.topic]
            };
            return {
                decode: function (log) {
                    return event_1.decode(log.data, log.topics);
                },
                event: event_1,
                eventTag: getEventTag(filter_1),
                filter: filter_1
            };
        }
        var filter = {
            address: this.address
        };
        // Find the matching event in the ABI; if none, we still allow filtering
        // since it may be a filter for an otherwise unknown event
        var event = null;
        if (eventName.topics && eventName.topics[0]) {
            filter.topics = eventName.topics;
            for (var name in this.interface.events) {
                if (name.indexOf('(') === -1) {
                    continue;
                }
                var e = this.interface.events[name];
                if (e.topic === eventName.topics[0].toLowerCase()) {
                    event = e;
                    break;
                }
            }
        }
        return {
            decode: function (log) {
                if (event) {
                    return event.decode(log.data, log.topics);
                }
                return [log];
            },
            event: event,
            eventTag: getEventTag(filter),
            filter: filter
        };
    };
    Contract.prototype._addEventListener = function (eventFilter, listener, once) {
        var _this = this;
        if (!this.provider) {
            errors.throwError('events require a provider or a signer with a provider', errors.UNSUPPORTED_OPERATION, { operation: 'once' });
        }
        var wrappedListener = function (log) {
            var decoded = Array.prototype.slice.call(eventFilter.decode(log));
            var event = properties_1.jsonCopy(log);
            event.args = decoded;
            event.decode = eventFilter.event.decode;
            event.event = eventFilter.event.name;
            event.eventSignature = eventFilter.event.signature;
            event.removeListener = function () { _this.removeListener(eventFilter.filter, listener); };
            event.getBlock = function () { return _this.provider.getBlock(log.blockHash); };
            event.getTransaction = function () { return _this.provider.getTransactionReceipt(log.transactionHash); };
            event.getTransactionReceipt = function () { return _this.provider.getTransactionReceipt(log.transactionHash); };
            decoded.push(event);
            _this.emit.apply(_this, [eventFilter.filter].concat(decoded));
        };
        this.provider.on(eventFilter.filter, wrappedListener);
        this._events.push({ eventFilter: eventFilter, listener: listener, wrappedListener: wrappedListener, once: once });
    };
    Contract.prototype.on = function (event, listener) {
        this._addEventListener(this._getEventFilter(event), listener, false);
        return this;
    };
    Contract.prototype.once = function (event, listener) {
        this._addEventListener(this._getEventFilter(event), listener, true);
        return this;
    };
    Contract.prototype.addEventLisener = function (eventName, listener) {
        return this.on(eventName, listener);
    };
    Contract.prototype.emit = function (eventName) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this.provider) {
            return false;
        }
        var result = false;
        var eventFilter = this._getEventFilter(eventName);
        this._events = this._events.filter(function (event) {
            if (event.eventFilter.eventTag !== eventFilter.eventTag) {
                return true;
            }
            setTimeout(function () {
                event.listener.apply(_this, args);
            }, 0);
            result = true;
            return !(event.once);
        });
        return result;
    };
    Contract.prototype.listenerCount = function (eventName) {
        if (!this.provider) {
            return 0;
        }
        var eventFilter = this._getEventFilter(eventName);
        return this._events.filter(function (event) {
            return event.eventFilter.eventTag === eventFilter.eventTag;
        }).length;
    };
    Contract.prototype.listeners = function (eventName) {
        if (!this.provider) {
            return [];
        }
        var eventFilter = this._getEventFilter(eventName);
        return this._events.filter(function (event) {
            return event.eventFilter.eventTag === eventFilter.eventTag;
        }).map(function (event) { return event.listener; });
    };
    Contract.prototype.removeAllListeners = function (eventName) {
        if (!this.provider) {
            return this;
        }
        var eventFilter = this._getEventFilter(eventName);
        this._events = this._events.filter(function (event) {
            return event.eventFilter.eventTag !== eventFilter.eventTag;
        });
        return this;
    };
    Contract.prototype.removeListener = function (eventName, listener) {
        var _this = this;
        if (!this.provider) {
            return this;
        }
        var found = false;
        var eventFilter = this._getEventFilter(eventName);
        this._events = this._events.filter(function (event) {
            // Make sure this event and listener match
            if (event.eventFilter.eventTag !== eventFilter.eventTag) {
                return true;
            }
            if (event.listener !== listener) {
                return true;
            }
            _this.provider.removeListener(event.eventFilter.filter, event.wrappedListener);
            // Already found a matching event in a previous loop
            if (found) {
                return true;
            }
            // REmove this event (returning false filters us out)
            found = true;
            return false;
        });
        return this;
    };
    return Contract;
}());
exports.Contract = Contract;
