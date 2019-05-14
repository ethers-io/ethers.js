"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var abi_1 = require("@ethersproject/abi");
var abstract_provider_1 = require("@ethersproject/abstract-provider");
var abstract_signer_1 = require("@ethersproject/abstract-signer");
var address_1 = require("@ethersproject/address");
var bignumber_1 = require("@ethersproject/bignumber");
var bytes_1 = require("@ethersproject/bytes");
var constants_1 = require("@ethersproject/constants");
var errors = __importStar(require("@ethersproject/errors"));
var properties_1 = require("@ethersproject/properties");
///////////////////////////////
var allowedTransactionKeys = {
    chainId: true, data: true, from: true, gasLimit: true, gasPrice: true, nonce: true, to: true, value: true
};
// Recursively replaces ENS names with promises to resolve the name and
// stalls until all promises have returned
// @TODO: Expand this to resolve any promises too
function resolveAddresses(signerOrProvider, value, paramType) {
    if (Array.isArray(paramType)) {
        return Promise.all(paramType.map(function (paramType, index) {
            return resolveAddresses(signerOrProvider, ((Array.isArray(value)) ? value[index] : value[paramType.name]), paramType);
        }));
    }
    if (paramType.type === "address") {
        return signerOrProvider.resolveName(value);
    }
    if (paramType.type === "tuple") {
        return resolveAddresses(signerOrProvider, value, paramType.components);
    }
    // Strips one level of array indexing off the end to recuse into
    //let isArrayMatch = paramType.type.match(/(.*)(\[[0-9]*\]$)/);
    if (paramType.baseType === "array") {
        if (!Array.isArray(value)) {
            throw new Error("invalid value for array");
        }
        return Promise.all(value.map(function (v) { return resolveAddresses(signerOrProvider, v, paramType.arrayChildren); }));
    }
    return Promise.resolve(value);
}
function runMethod(contract, functionName, options) {
    var method = contract.interface.functions[functionName];
    return function () {
        var _this = this;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var tx = {};
        var blockTag = null;
        // If 1 extra parameter was passed in, it contains overrides
        if (params.length === method.inputs.length + 1 && typeof (params[params.length - 1]) === "object") {
            tx = properties_1.shallowCopy(params.pop());
            if (tx.blockTag != null) {
                blockTag = tx.blockTag;
            }
            delete tx.blockTag;
            // Check for unexpected keys (e.g. using "gas" instead of "gasLimit")
            for (var key in tx) {
                if (!allowedTransactionKeys[key]) {
                    errors.throwError(("unknown transaxction override - " + key), "overrides", tx);
                }
            }
        }
        errors.checkArgumentCount(params.length, method.inputs.length, "passed to contract");
        // Check overrides make sense
        ["data", "to"].forEach(function (key) {
            if (tx[key] != null) {
                errors.throwError("cannot override " + key, errors.UNSUPPORTED_OPERATION, { operation: key });
            }
        });
        // If the contract was just deployed, wait until it is minded
        if (contract.deployTransaction != null) {
            tx.to = contract._deployed(blockTag).then(function () {
                return contract.addressPromise;
            });
        }
        else {
            tx.to = contract.addressPromise;
        }
        return resolveAddresses(contract.signer || contract.provider, params, method.inputs).then(function (params) {
            tx.data = contract.interface.encodeFunctionData(method, params);
            if (method.constant || options.callStatic) {
                // Call (constant functions) always cost 0 ether
                if (options.estimate) {
                    return Promise.resolve(constants_1.Zero);
                }
                if (!contract.provider && !contract.signer) {
                    errors.throwError("call (constant functions) require a provider or signer", errors.UNSUPPORTED_OPERATION, { operation: "call" });
                }
                // Check overrides make sense
                ["gasLimit", "gasPrice", "value"].forEach(function (key) {
                    if (tx[key] != null) {
                        throw new Error("call cannot override " + key);
                    }
                });
                if (options.transaction) {
                    return properties_1.resolveProperties(tx);
                }
                return (contract.signer || contract.provider).call(tx, blockTag).then(function (value) {
                    try {
                        var result = contract.interface.decodeFunctionResult(method, value);
                        if (method.outputs.length === 1) {
                            result = result[0];
                        }
                        return result;
                    }
                    catch (error) {
                        if (error.code === errors.CALL_EXCEPTION) {
                            error.address = contract.address;
                            error.args = params;
                            error.transaction = tx;
                        }
                        throw error;
                    }
                });
            }
            // Only computing the transaction estimate
            if (options.estimate) {
                if (!contract.provider && !contract.signer) {
                    errors.throwError("estimate require a provider or signer", errors.UNSUPPORTED_OPERATION, { operation: "estimateGas" });
                }
                return (contract.signer || contract.provider).estimateGas(tx);
            }
            if (tx.gasLimit == null && method.gas != null) {
                tx.gasLimit = bignumber_1.BigNumber.from(method.gas).add(21000);
            }
            if (tx.value != null && !method.payable) {
                errors.throwError("contract method is not payable", errors.INVALID_ARGUMENT, {
                    argument: "sendTransaction",
                    value: tx,
                    method: method.format()
                });
            }
            if (!contract.signer) {
                errors.throwError("sending a transaction require a signer", errors.UNSUPPORTED_OPERATION, { operation: "sendTransaction" });
            }
            if (options.transaction) {
                return tx;
            }
            return contract.signer.sendTransaction(tx).then(function (tx) {
                var wait = tx.wait.bind(tx);
                tx.wait = function (confirmations) {
                    return wait(confirmations).then(function (receipt) {
                        receipt.events = receipt.logs.map(function (log) {
                            var event = properties_1.deepCopy(log);
                            var parsed = contract.interface.parseLog(log);
                            if (parsed) {
                                event.values = parsed.values;
                                event.decode = function (data, topics) {
                                    return _this.interface.decodeEventLog(parsed.eventFragment, data, topics);
                                };
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
        });
    };
}
function getEventTag(filter) {
    if (filter.address && (filter.topics == null || filter.topics.length === 0)) {
        return "*";
    }
    return (filter.address || "*") + "@" + (filter.topics ? filter.topics.join(":") : "");
}
var Contract = /** @class */ (function () {
    // https://github.com/Microsoft/TypeScript/issues/5453
    // Once this issue is resolved (there are open PR) we can do this nicer
    // by making addressOrName default to null for 2 operand calls. :)
    function Contract(addressOrName, contractInterface, signerOrProvider) {
        var _newTarget = this.constructor;
        var _this = this;
        errors.checkNew(_newTarget, Contract);
        // @TODO: Maybe still check the addressOrName looks like a valid address or name?
        //address = getAddress(address);
        properties_1.defineReadOnly(this, "interface", _newTarget.getInterface(contractInterface));
        if (properties_1.isNamedInstance(abstract_signer_1.Signer, signerOrProvider)) {
            properties_1.defineReadOnly(this, "provider", signerOrProvider.provider);
            properties_1.defineReadOnly(this, "signer", signerOrProvider);
        }
        else if (properties_1.isNamedInstance(abstract_provider_1.Provider, signerOrProvider)) {
            properties_1.defineReadOnly(this, "provider", signerOrProvider);
            properties_1.defineReadOnly(this, "signer", null);
        }
        else {
            errors.throwError("invalid signer or provider", errors.INVALID_ARGUMENT, { arg: "signerOrProvider", value: signerOrProvider });
        }
        properties_1.defineReadOnly(this, "callStatic", {});
        properties_1.defineReadOnly(this, "estimate", {});
        properties_1.defineReadOnly(this, "functions", {});
        properties_1.defineReadOnly(this, "populateTransaction", {});
        properties_1.defineReadOnly(this, "filters", {});
        Object.keys(this.interface.events).forEach(function (eventName) {
            var event = _this.interface.events[eventName];
            properties_1.defineReadOnly(_this.filters, eventName, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return {
                    address: _this.address,
                    topics: _this.interface.encodeFilterTopics(event, args)
                };
            });
        });
        this._events = [];
        properties_1.defineReadOnly(this, "address", addressOrName);
        if (this.provider) {
            properties_1.defineReadOnly(this, "addressPromise", this.provider.resolveName(addressOrName).then(function (address) {
                if (address == null) {
                    throw new Error("name not found");
                }
                return address;
            }).catch(function (error) {
                console.log("ERROR: Cannot find Contract - " + addressOrName);
                throw error;
            }));
        }
        else {
            try {
                properties_1.defineReadOnly(this, "addressPromise", Promise.resolve((this.interface.constructor).getAddress(addressOrName)));
            }
            catch (error) {
                // Without a provider, we cannot use ENS names
                errors.throwError("provider is required to use non-address contract address", errors.INVALID_ARGUMENT, { argument: "addressOrName", value: addressOrName });
            }
        }
        Object.keys(this.interface.functions).forEach(function (name) {
            var run = runMethod(_this, name, {});
            if (_this[name] == null) {
                properties_1.defineReadOnly(_this, name, run);
            }
            if (_this.functions[name] == null) {
                properties_1.defineReadOnly(_this.functions, name, run);
            }
            if (_this.callStatic[name] == null) {
                properties_1.defineReadOnly(_this.callStatic, name, runMethod(_this, name, { callStatic: true }));
            }
            if (_this.populateTransaction[name] == null) {
                properties_1.defineReadOnly(_this.populateTransaction, name, runMethod(_this, name, { transaction: true }));
            }
            if (_this.estimate[name] == null) {
                properties_1.defineReadOnly(_this.estimate, name, runMethod(_this, name, { estimate: true }));
            }
        });
    }
    Contract.getContractAddress = function (transaction) {
        return address_1.getContractAddress(transaction);
    };
    Contract.getInterface = function (contractInterface) {
        if (properties_1.isNamedInstance(abi_1.Interface, contractInterface)) {
            return contractInterface;
        }
        return new abi_1.Interface(contractInterface);
    };
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
                    if (code === "0x") {
                        errors.throwError("contract not deployed", errors.UNSUPPORTED_OPERATION, {
                            contractAddress: _this.address,
                            operation: "getDeployed"
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
            errors.throwError("sending a transaction require a signer", errors.UNSUPPORTED_OPERATION, { operation: "sendTransaction(fallback)" });
        }
        var tx = properties_1.shallowCopy(overrides || {});
        ["from", "to"].forEach(function (key) {
            if (tx[key] == null) {
                return;
            }
            errors.throwError("cannot override " + key, errors.UNSUPPORTED_OPERATION, { operation: key });
        });
        tx.to = this.addressPromise;
        return this.deployed().then(function () {
            return _this.signer.sendTransaction(tx);
        });
    };
    // Reconnect to a different signer or provider
    Contract.prototype.connect = function (signerOrProvider) {
        if (typeof (signerOrProvider) === "string") {
            signerOrProvider = new abstract_signer_1.VoidSigner(signerOrProvider, this.provider);
        }
        var contract = new (this.constructor)(this.address, this.interface, signerOrProvider);
        if (this.deployTransaction) {
            properties_1.defineReadOnly(contract, "deployTransaction", this.deployTransaction);
        }
        return contract;
    };
    // Re-attach to a different on-chain instance of this contract
    Contract.prototype.attach = function (addressOrName) {
        return new (this.constructor)(addressOrName, this.interface, this.signer || this.provider);
    };
    Contract.isIndexed = function (value) {
        return properties_1.isNamedInstance(abi_1.Indexed, value);
    };
    Contract.prototype._getEventFilter = function (eventName) {
        var _this = this;
        if (typeof (eventName) === "string") {
            // Listen for any event
            if (eventName === "*") {
                return {
                    prepareEvent: function (e) {
                        var parsed = _this.interface.parseLog(e);
                        if (parsed) {
                            e.values = parsed.values;
                            e.decode = function (data, topics) {
                                return _this.interface.decodeEventLog(parsed.eventFragment, data, topics);
                            },
                                e.event = parsed.name;
                            e.eventSignature = parsed.signature;
                        }
                    },
                    eventTag: "*",
                    filter: { address: this.address },
                };
            }
            var fragment_1 = this.interface.getEvent(eventName);
            if (!fragment_1) {
                errors.throwError("unknown event - " + eventName, errors.INVALID_ARGUMENT, { argumnet: "eventName", value: eventName });
            }
            var filter_1 = {
                address: this.address,
                topics: [this.interface.getEventTopic(fragment_1)]
            };
            return {
                prepareEvent: function (e) {
                    e.values = _this.interface.decodeEventLog(fragment_1, e.data, e.topics);
                },
                fragment: fragment_1,
                eventTag: getEventTag(filter_1),
                filter: filter_1
            };
        }
        var filter = {
            address: this.address
        };
        // Find the matching event in the ABI; if none, we still allow filtering
        // since it may be a filter for an otherwise unknown event
        var fragment = null;
        if (eventName.topics && eventName.topics[0]) {
            filter.topics = eventName.topics;
            fragment = this.interface.getEvent(eventName.topics[0]);
        }
        return {
            prepareEvent: function (e) {
                if (!fragment) {
                    return;
                }
                e.values = _this.interface.decodeEventLog(fragment, e.data, e.topics);
            },
            fragment: fragment,
            eventTag: getEventTag(filter),
            filter: filter
        };
    };
    // @TODO: move this to _EventFilter.wrapLog. Maybe into prepareEvent?
    Contract.prototype._wrapEvent = function (eventFilter, log, listener) {
        var _this = this;
        var event = properties_1.deepCopy(log);
        // @TODO: Move all the below stuff into prepare
        eventFilter.prepareEvent(event);
        if (eventFilter.fragment) {
            event.decode = function (data, topics) {
                return _this.interface.decodeEventLog(eventFilter.fragment, data, topics);
            },
                event.event = eventFilter.fragment.name;
            event.eventSignature = eventFilter.fragment.format();
        }
        event.removeListener = function () {
            if (!listener) {
                return;
            }
            _this.removeListener(eventFilter.filter, listener);
        };
        event.getBlock = function () { return _this.provider.getBlock(log.blockHash); };
        event.getTransaction = function () { return _this.provider.getTransaction(log.transactionHash); };
        event.getTransactionReceipt = function () { return _this.provider.getTransactionReceipt(log.transactionHash); };
        return event;
    };
    Contract.prototype._addEventListener = function (eventFilter, listener, once) {
        var _this = this;
        if (!this.provider) {
            errors.throwError("events require a provider or a signer with a provider", errors.UNSUPPORTED_OPERATION, { operation: "once" });
        }
        var wrappedListener = function (log) {
            var event = _this._wrapEvent(eventFilter, log, listener);
            var values = (event.values || []);
            values.push(event);
            _this.emit.apply(_this, [eventFilter.filter].concat(values));
        };
        this.provider.on(eventFilter.filter, wrappedListener);
        this._events.push({ eventFilter: eventFilter, listener: listener, wrappedListener: wrappedListener, once: once });
    };
    Contract.prototype.queryFilter = function (event, fromBlockOrBlockhash, toBlock) {
        var _this = this;
        var eventFilter = this._getEventFilter(event);
        var filter = properties_1.shallowCopy(eventFilter.filter);
        if (typeof (fromBlockOrBlockhash) === "string" && bytes_1.isHexString(fromBlockOrBlockhash, 32)) {
            filter.blockhash = fromBlockOrBlockhash;
            if (toBlock != null) {
                errors.throwArgumentError("cannot specify toBlock with blockhash", "toBlock", toBlock);
            }
        }
        else {
            filter.fromBlock = ((fromBlockOrBlockhash != null) ? fromBlockOrBlockhash : 0);
            filter.toBlock = ((toBlock != null) ? toBlock : "latest");
        }
        return this.provider.getLogs(filter).then(function (logs) {
            return logs.map(function (log) { return _this._wrapEvent(eventFilter, log, null); });
        });
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
        if (eventName == null) {
            return this._events.map(function (event) { return event.listener; });
        }
        var eventFilter = this._getEventFilter(eventName);
        return this._events
            .filter(function (event) { return (event.eventFilter.eventTag === eventFilter.eventTag); })
            .map(function (event) { return event.listener; });
    };
    Contract.prototype.removeAllListeners = function (eventName) {
        var _this = this;
        if (!this.provider) {
            return this;
        }
        var eventFilter = this._getEventFilter(eventName);
        this._events = this._events.filter(function (event) {
            // Keep non-matching events
            if (event.eventFilter.eventTag !== eventFilter.eventTag) {
                return true;
            }
            // De-register this event from the provider and filter it out
            _this.provider.removeListener(event.eventFilter.filter, event.wrappedListener);
            return false;
        });
        return this;
    };
    Contract.prototype.off = function (eventName, listener) {
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
            // Remove this event (returning false filters us out)
            found = true;
            return false;
        });
        return this;
    };
    Contract.prototype.removeListener = function (eventName, listener) {
        return this.off(eventName, listener);
    };
    return Contract;
}());
exports.Contract = Contract;
var ContractFactory = /** @class */ (function () {
    function ContractFactory(contractInterface, bytecode, signer) {
        var _newTarget = this.constructor;
        var bytecodeHex = null;
        if (typeof (bytecode) === "string") {
            bytecodeHex = bytecode;
        }
        else if (bytes_1.isBytes(bytecode)) {
            bytecodeHex = bytes_1.hexlify(bytecode);
        }
        else if (bytecode && typeof (bytecode.object) === "string") {
            // Allow the bytecode object from the Solidity compiler
            bytecodeHex = bytecode.object;
        }
        else {
            // Crash in the next verification step
            bytecodeHex = "!";
        }
        // Make sure it is 0x prefixed
        if (bytecodeHex.substring(0, 2) !== "0x") {
            bytecodeHex = "0x" + bytecodeHex;
        }
        // Make sure the final result is valid bytecode
        if (!bytes_1.isHexString(bytecodeHex) || (bytecodeHex.length % 2)) {
            errors.throwArgumentError("invalid bytecode", "bytecode", bytecode);
        }
        // If we have a signer, make sure it is valid
        if (signer && !properties_1.isNamedInstance(abstract_signer_1.Signer, signer)) {
            errors.throwArgumentError("invalid signer", "signer", signer);
        }
        properties_1.defineReadOnly(this, "bytecode", bytecodeHex);
        properties_1.defineReadOnly(this, "interface", _newTarget.getInterface(contractInterface));
        properties_1.defineReadOnly(this, "signer", signer || null);
    }
    ContractFactory.prototype.getDeployTransaction = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var tx = {};
        // If we have 1 additional argument, we allow transaction overrides
        if (args.length === this.interface.deploy.inputs.length + 1) {
            tx = properties_1.shallowCopy(args.pop());
            for (var key in tx) {
                if (!allowedTransactionKeys[key]) {
                    throw new Error("unknown transaction override " + key);
                }
            }
        }
        // Do not allow these to be overridden in a deployment transaction
        ["data", "from", "to"].forEach(function (key) {
            if (tx[key] == null) {
                return;
            }
            errors.throwError("cannot override " + key, errors.UNSUPPORTED_OPERATION, { operation: key });
        });
        // Make sure the call matches the constructor signature
        errors.checkArgumentCount(args.length, this.interface.deploy.inputs.length, " in Contract constructor");
        // Set the data to the bytecode + the encoded constructor arguments
        tx.data = bytes_1.hexlify(bytes_1.concat([
            this.bytecode,
            this.interface.encodeDeploy(args)
        ]));
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
            var address = (_this.constructor).getContractAddress(tx);
            var contract = (_this.constructor).getContract(address, _this.interface, _this.signer);
            properties_1.defineReadOnly(contract, "deployTransaction", tx);
            return contract;
        });
    };
    ContractFactory.prototype.attach = function (address) {
        return (this.constructor).getContract(address, this.interface, this.signer);
    };
    ContractFactory.prototype.connect = function (signer) {
        return new (this.constructor)(this.interface, this.bytecode, signer);
    };
    ContractFactory.fromSolidity = function (compilerOutput, signer) {
        if (compilerOutput == null) {
            errors.throwError("missing compiler output", errors.MISSING_ARGUMENT, { argument: "compilerOutput" });
        }
        if (typeof (compilerOutput) === "string") {
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
        return new this(abi, bytecode, signer);
    };
    ContractFactory.getInterface = function (contractInterface) {
        return Contract.getInterface(contractInterface);
    };
    ContractFactory.getContractAddress = function (tx) {
        return address_1.getContractAddress(tx);
    };
    ContractFactory.getContract = function (address, contractInterface, signer) {
        return new Contract(address, contractInterface, signer);
    };
    return ContractFactory;
}());
exports.ContractFactory = ContractFactory;
