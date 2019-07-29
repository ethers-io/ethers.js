'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var errors = __importStar(require("./errors"));
var abi_coder_1 = require("./utils/abi-coder");
var address_1 = require("./utils/address");
var bignumber_1 = require("./utils/bignumber");
var bytes_1 = require("./utils/bytes");
var interface_1 = require("./utils/interface");
var properties_1 = require("./utils/properties");
///////////////////////////////
// Imported Abstracts
var abstract_provider_1 = require("./providers/abstract-provider");
var abstract_signer_1 = require("./abstract-signer");
///////////////////////////////
var VoidSigner = /** @class */ (function (_super) {
    __extends(VoidSigner, _super);
    function VoidSigner(address, provider) {
        var _this = _super.call(this) || this;
        properties_1.defineReadOnly(_this, 'address', address);
        properties_1.defineReadOnly(_this, 'provider', provider);
        return _this;
    }
    VoidSigner.prototype.getAddress = function () {
        return Promise.resolve(this.address);
    };
    VoidSigner.prototype._fail = function (message, operation) {
        return Promise.resolve().then(function () {
            errors.throwError(message, errors.UNSUPPORTED_OPERATION, { operation: operation });
        });
    };
    VoidSigner.prototype.signMessage = function (message) {
        return this._fail('VoidSigner cannot sign messages', 'signMessage');
    };
    VoidSigner.prototype.sendTransaction = function (transaction) {
        return this._fail('VoidSigner cannot sign transactions', 'sendTransaction');
    };
    VoidSigner.prototype.connect = function (provider) {
        return new VoidSigner(this.address, provider);
    };
    return VoidSigner;
}(abstract_signer_1.Signer));
exports.VoidSigner = VoidSigner;
var allowedTransactionKeys = {
    chainId: true, data: true, from: true, gasLimit: true, gasPrice: true, nonce: true, to: true, value: true
};
// Recursively replaces ENS names with promises to resolve the name and
// stalls until all promises have returned
// @TODO: Expand this to resolve any promises too
function resolveAddresses(provider, value, paramType) {
    if (Array.isArray(paramType)) {
        var promises_1 = [];
        paramType.forEach(function (paramType, index) {
            var v = null;
            if (Array.isArray(value)) {
                v = value[index];
            }
            else {
                v = value[paramType.name];
            }
            promises_1.push(resolveAddresses(provider, v, paramType));
        });
        return Promise.all(promises_1);
    }
    if (paramType.type === 'address') {
        return provider.resolveName(value);
    }
    if (paramType.type === 'tuple') {
        return resolveAddresses(provider, value, paramType.components);
    }
    // Strips one level of array indexing off the end to recuse into
    var isArrayMatch = paramType.type.match(/(.*)(\[[0-9]*\]$)/);
    if (isArrayMatch) {
        if (!Array.isArray(value)) {
            throw new Error('invalid value for array');
        }
        var promises = [];
        var subParamType = {
            components: paramType.components,
            type: isArrayMatch[1],
        };
        value.forEach(function (v) {
            promises.push(resolveAddresses(provider, v, subParamType));
        });
        return Promise.all(promises);
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
        var blockTag = null;
        // If 1 extra parameter was passed in, it contains overrides
        if (params.length === method.inputs.length + 1 && typeof (params[params.length - 1]) === 'object') {
            tx = properties_1.shallowCopy(params.pop());
            if (tx.blockTag != null) {
                blockTag = tx.blockTag;
            }
            delete tx.blockTag;
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
        tx.to = contract._deployed(blockTag).then(function () {
            return contract.addressPromise;
        });
        return resolveAddresses(contract.provider, params, method.inputs).then(function (params) {
            tx.data = method.encode(params);
            if (method.type === 'call') {
                // Call (constant functions) always cost 0 ether
                if (estimateOnly) {
                    return Promise.resolve(constants_1.Zero);
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
                return contract.provider.call(tx, blockTag).then(function (value) {
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
                if (tx.gasLimit == null && method.gas != null) {
                    tx.gasLimit = bignumber_1.bigNumberify(method.gas).add(21000);
                }
                if (!contract.signer) {
                    errors.throwError('sending a transaction requires a signer', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction' });
                }
                // Make sure they aren't overriding something they shouldn't
                if (tx.from != null) {
                    errors.throwError('cannot override from in a transaction', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction' });
                }
                return contract.signer.sendTransaction(tx).then(function (tx) {
                    var wait = tx.wait.bind(tx);
                    tx.wait = function (confirmations) {
                        return wait(confirmations).then(function (receipt) {
                            receipt.events = receipt.logs.map(function (log) {
                                var event = properties_1.deepCopy(log);
                                var parsed = contract.interface.parseLog(log);
                                if (parsed) {
                                    event.args = parsed.values;
                                    event.decode = parsed.decode;
                                    event.event = parsed.name;
                                    event.eventSignature = parsed.signature;
                                }
                                event.removeListener = function () { return contract.provider; };
                                event.getBlock = function () {
                                    return contract.provider.getBlock(receipt.blockHash);
                                };
                                event.getTransaction = function () {
                                    return contract.provider.getTransaction(receipt.transactionHash);
                                };
                                event.getTransactionReceipt = function () {
                                    return Promise.resolve(receipt);
                                };
                                return event;
                            });
                            return receipt;
                        });
                    };
                    return tx;
                });
            }
            throw new Error('invalid type - ' + method.type);
            return null;
        });
    };
}
function getEventTag(filter) {
    if (filter.address && (filter.topics == null || filter.topics.length === 0)) {
        return '*';
    }
    return (filter.address || '*') + '@' + (filter.topics ? filter.topics.join(':') : '');
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
        if (interface_1.Interface.isInterface(contractInterface)) {
            properties_1.defineReadOnly(this, 'interface', contractInterface);
        }
        else {
            properties_1.defineReadOnly(this, 'interface', new interface_1.Interface(contractInterface));
        }
        if (abstract_signer_1.Signer.isSigner(signerOrProvider)) {
            properties_1.defineReadOnly(this, 'provider', signerOrProvider.provider);
            properties_1.defineReadOnly(this, 'signer', signerOrProvider);
        }
        else if (abstract_provider_1.Provider.isProvider(signerOrProvider)) {
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
        this._events = [];
        properties_1.defineReadOnly(this, 'address', addressOrName);
        if (this.provider) {
            properties_1.defineReadOnly(this, 'addressPromise', this.provider.resolveName(addressOrName).then(function (address) {
                if (address == null) {
                    throw new Error('name not found');
                }
                return address;
            }).catch(function (error) {
                throw error;
            }));
        }
        else {
            try {
                properties_1.defineReadOnly(this, 'addressPromise', Promise.resolve(address_1.getAddress(addressOrName)));
            }
            catch (error) {
                // Without a provider, we cannot use ENS names
                errors.throwError('provider is required to use non-address contract address', errors.INVALID_ARGUMENT, { argument: 'addressOrName', value: addressOrName });
            }
        }
        Object.keys(this.interface.functions).forEach(function (name) {
            var run = runMethod(_this, name, false);
            if (_this[name] == null) {
                properties_1.defineReadOnly(_this, name, run);
            }
            else {
                errors.warn('WARNING: Multiple definitions for ' + name);
            }
            if (_this.functions[name] == null) {
                properties_1.defineReadOnly(_this.functions, name, run);
                properties_1.defineReadOnly(_this.estimate, name, runMethod(_this, name, true));
            }
        });
    }
    // @TODO: Allow timeout?
    Contract.prototype.deployed = function () {
        return this._deployed();
    };
    Contract.prototype._deployed = function (blockTag) {
        var _this = this;
        if (!this._deployedPromise) {
            // If we were just deployed, we know the transaction we should occur in
            if (this.deployTransaction) {
                this._deployedPromise = this.deployTransaction.wait().then(function () {
                    return _this;
                });
            }
            else {
                // @TODO: Once we allow a timeout to be passed in, we will wait
                // up to that many blocks for getCode
                // Otherwise, poll for our code to be deployed
                this._deployedPromise = this.provider.getCode(this.address, blockTag).then(function (code) {
                    if (code === '0x') {
                        errors.throwError('contract not deployed', errors.UNSUPPORTED_OPERATION, {
                            contractAddress: _this.address,
                            operation: 'getDeployed'
                        });
                    }
                    return _this;
                });
            }
        }
        return this._deployedPromise;
    };
    // @TODO:
    // estimateFallback(overrides?: TransactionRequest): Promise<BigNumber>
    // @TODO:
    // estimateDeploy(bytecode: string, ...args): Promise<BigNumber>
    Contract.prototype.fallback = function (overrides) {
        var _this = this;
        if (!this.signer) {
            errors.throwError('sending a transaction requires a signer', errors.UNSUPPORTED_OPERATION, { operation: 'sendTransaction(fallback)' });
        }
        var tx = properties_1.shallowCopy(overrides || {});
        ['from', 'to'].forEach(function (key) {
            if (tx[key] == null) {
                return;
            }
            errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key });
        });
        tx.to = this.addressPromise;
        return this.deployed().then(function () {
            return _this.signer.sendTransaction(tx);
        });
    };
    // Reconnect to a different signer or provider
    Contract.prototype.connect = function (signerOrProvider) {
        if (typeof (signerOrProvider) === 'string') {
            signerOrProvider = new VoidSigner(signerOrProvider, this.provider);
        }
        var contract = new Contract(this.address, this.interface, signerOrProvider);
        if (this.deployTransaction) {
            properties_1.defineReadOnly(contract, 'deployTransaction', this.deployTransaction);
        }
        return contract;
    };
    // Re-attach to a different on=chain instance of this contract
    Contract.prototype.attach = function (addressOrName) {
        return new Contract(addressOrName, this.interface, this.signer || this.provider);
    };
    Contract.isIndexed = function (value) {
        return interface_1.Interface.isIndexed(value);
    };
    Contract.prototype._getEventFilter = function (eventName) {
        var _this = this;
        if (typeof (eventName) === 'string') {
            // Listen for any event
            if (eventName === '*') {
                return {
                    prepareEvent: function (e) {
                        var parsed = _this.interface.parseLog(e);
                        if (parsed) {
                            e.args = parsed.values;
                            e.decode = parsed.decode;
                            e.event = parsed.name;
                            e.eventSignature = parsed.signature;
                        }
                        return [e];
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
                prepareEvent: function (e) {
                    var args = event_1.decode(e.data, e.topics);
                    e.args = args;
                    var result = Array.prototype.slice.call(args);
                    result.push(e);
                    return result;
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
            for (var name_1 in this.interface.events) {
                if (name_1.indexOf('(') === -1) {
                    continue;
                }
                var e = this.interface.events[name_1];
                if (e.topic === eventName.topics[0].toLowerCase()) {
                    event = e;
                    break;
                }
            }
        }
        return {
            prepareEvent: function (e) {
                if (!event) {
                    return [e];
                }
                var args = event.decode(e.data, e.topics);
                e.args = args;
                var result = Array.prototype.slice.call(args);
                result.push(e);
                return result;
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
            var event = properties_1.deepCopy(log);
            var args = eventFilter.prepareEvent(event);
            if (eventFilter.event) {
                event.decode = eventFilter.event.decode;
                event.event = eventFilter.event.name;
                event.eventSignature = eventFilter.event.signature;
            }
            event.removeListener = function () { _this.removeListener(eventFilter.filter, listener); };
            event.getBlock = function () { return _this.provider.getBlock(log.blockHash); };
            event.getTransaction = function () { return _this.provider.getTransaction(log.transactionHash); };
            event.getTransactionReceipt = function () { return _this.provider.getTransactionReceipt(log.transactionHash); };
            _this.emit.apply(_this, [eventFilter.filter].concat(args));
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
    Contract.prototype.addListener = function (eventName, listener) {
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
            // Not this event (keep it for later)
            if (event.eventFilter.eventTag !== eventFilter.eventTag) {
                return true;
            }
            // Call the callback in the next event loop
            setTimeout(function () {
                event.listener.apply(_this, args);
            }, 0);
            result = true;
            // Reschedule it if it not "once"
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
        var _this = this;
        if (!this.provider) {
            return this;
        }
        var eventFilter = this._getEventFilter(eventName);
        this._events = this._events.filter(function (event) {
            // Keep all other events
            if (event.eventFilter.eventTag !== eventFilter.eventTag) {
                return true;
            }
            // Deregister this event from the provider and filter it out
            _this.provider.removeListener(event.eventFilter.filter, event.wrappedListener);
            return false;
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
var ContractFactory = /** @class */ (function () {
    function ContractFactory(contractInterface, bytecode, signer) {
        var bytecodeHex = null;
        // Allow the bytecode object from the Solidity compiler
        if (typeof (bytecode) === 'string') {
            bytecodeHex = bytecode;
        }
        else if (bytes_1.isArrayish(bytecode)) {
            bytecodeHex = bytes_1.hexlify(bytecode);
        }
        else if (typeof (bytecode.object) === 'string') {
            bytecodeHex = bytecode.object;
        }
        else {
            errors.throwError('bytecode must be a valid hex string', errors.INVALID_ARGUMENT, { arg: 'bytecode', value: bytecode });
        }
        // Make sure it is 0x prefixed
        if (bytecodeHex.substring(0, 2) !== '0x') {
            bytecodeHex = '0x' + bytecodeHex;
        }
        if (!bytes_1.isHexString(bytecodeHex)) {
            errors.throwError('bytecode must be a valid hex string', errors.INVALID_ARGUMENT, { arg: 'bytecode', value: bytecode });
        }
        if ((bytecodeHex.length % 2) !== 0) {
            errors.throwError('bytecode must be valid data (even length)', errors.INVALID_ARGUMENT, { arg: 'bytecode', value: bytecode });
        }
        properties_1.defineReadOnly(this, 'bytecode', bytecodeHex);
        if (interface_1.Interface.isInterface(contractInterface)) {
            properties_1.defineReadOnly(this, 'interface', contractInterface);
        }
        else {
            properties_1.defineReadOnly(this, 'interface', new interface_1.Interface(contractInterface));
        }
        if (signer && !abstract_signer_1.Signer.isSigner(signer)) {
            errors.throwError('invalid signer', errors.INVALID_ARGUMENT, { arg: 'signer', value: null });
        }
        properties_1.defineReadOnly(this, 'signer', signer || null);
    }
    ContractFactory.prototype.getDeployTransaction = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var tx = {};
        // If we have 1 additional argument, we allow transaction overrides
        if (args.length === this.interface.deployFunction.inputs.length + 1) {
            tx = properties_1.shallowCopy(args.pop());
            for (var key in tx) {
                if (!allowedTransactionKeys[key]) {
                    throw new Error('unknown transaction override ' + key);
                }
            }
        }
        // Do not allow these to be overridden in a deployment transaction
        ['data', 'from', 'to'].forEach(function (key) {
            if (tx[key] == null) {
                return;
            }
            errors.throwError('cannot override ' + key, errors.UNSUPPORTED_OPERATION, { operation: key });
        });
        // Make sure the call matches the constructor signature
        errors.checkArgumentCount(args.length, this.interface.deployFunction.inputs.length, ' in Contract constructor');
        // Set the data to the bytecode + the encoded constructor arguments
        tx.data = this.interface.deployFunction.encode(this.bytecode, args);
        return tx;
    };
    ContractFactory.prototype.deploy = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // Get the deployment transaction (with optional overrides)
        var tx = this.getDeployTransaction.apply(this, args);
        // Send the deployment transaction
        return this.signer.sendTransaction(tx).then(function (tx) {
            var contract = new Contract(address_1.getContractAddress(tx), _this.interface, _this.signer);
            properties_1.defineReadOnly(contract, 'deployTransaction', tx);
            return contract;
        });
    };
    ContractFactory.prototype.attach = function (address) {
        return new Contract(address, this.interface, this.signer);
    };
    ContractFactory.prototype.connect = function (signer) {
        return new ContractFactory(this.interface, this.bytecode, signer);
    };
    ContractFactory.fromSolidity = function (compilerOutput, signer) {
        if (compilerOutput == null) {
            errors.throwError('missing compiler output', errors.MISSING_ARGUMENT, { argument: 'compilerOutput' });
        }
        if (typeof (compilerOutput) === 'string') {
            compilerOutput = JSON.parse(compilerOutput);
        }
        var abi = compilerOutput.abi;
        var bytecode = null;
        if (compilerOutput.bytecode) {
            bytecode = compilerOutput.bytecode;
        }
        else if (compilerOutput.evm && compilerOutput.evm.bytecode) {
            bytecode = compilerOutput.evm.bytecode;
        }
        return new ContractFactory(abi, bytecode, signer);
    };
    return ContractFactory;
}());
exports.ContractFactory = ContractFactory;
