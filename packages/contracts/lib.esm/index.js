"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { checkResultErrors, Indexed, Interface } from "@ethersproject/abi";
import { Provider } from "@hethers/abstract-provider";
import { composeHederaTimestamp } from "@hethers/providers";
import { Signer, VoidSigner } from "@hethers/abstract-signer";
import { getAddress, getAddressFromAccount } from "@hethers/address";
import { BigNumber } from "@ethersproject/bignumber";
import { arrayify, concat, hexlify, isBytes, isHexString } from "@ethersproject/bytes";
import { deepCopy, defineReadOnly, getStatic, resolveProperties, shallowCopy } from "@ethersproject/properties";
import { accessListify } from "@hethers/transactions";
import { Logger } from "@hethers/logger";
import { version } from "./_version";
const logger = new Logger(version);
///////////////////////////////
const allowedTransactionKeys = {
    chainId: true, data: true, from: true, gasLimit: true, gasPrice: true, to: true, value: true,
    type: true,
    maxFeePerGas: true, maxPriorityFeePerGas: true,
    customData: true, nodeId: true,
};
function populateTransaction(contract, fragment, args) {
    return __awaiter(this, void 0, void 0, function* () {
        // If an extra argument is given, it is overrides
        let overrides = {};
        if (args.length === fragment.inputs.length + 1 && typeof (args[args.length - 1]) === "object") {
            overrides = shallowCopy(args.pop());
        }
        // Make sure the parameter count matches
        logger.checkArgumentCount(args.length, fragment.inputs.length, "passed to contract");
        // Populate "from" override (allow promises)
        if (contract.signer) {
            if (overrides.from) {
                // Contracts with a Signer are from the Signer's frame-of-reference;
                // but we allow overriding "from" if it matches the signer
                overrides.from = resolveProperties({
                    override: overrides.from,
                    signer: contract.signer.getAddress()
                }).then((check) => __awaiter(this, void 0, void 0, function* () {
                    if (getAddress(check.signer) !== check.override) {
                        logger.throwError("Contract with a Signer cannot override from", Logger.errors.UNSUPPORTED_OPERATION, {
                            operation: "overrides.from"
                        });
                    }
                    return check.override;
                }));
            }
            else {
                overrides.from = contract.signer.getAddress();
            }
        }
        // Wait for all dependencies to be resolved (prefer the signer over the provider)
        const resolved = yield resolveProperties({
            args: args,
            address: contract.address,
            overrides: (resolveProperties(overrides) || {})
        });
        // The ABI coded transaction
        const data = contract.interface.encodeFunctionData(fragment, resolved.args);
        const tx = {
            data: data,
            to: resolved.address
        };
        // Resolved Overrides
        const ro = resolved.overrides;
        // Populate simple overrides
        if (ro.gasLimit != null) {
            tx.gasLimit = BigNumber.from(ro.gasLimit);
        }
        if (ro.maxFeePerGas != null) {
            tx.maxFeePerGas = BigNumber.from(ro.maxFeePerGas);
        }
        if (ro.maxPriorityFeePerGas != null) {
            tx.maxPriorityFeePerGas = BigNumber.from(ro.maxPriorityFeePerGas);
        }
        if (ro.from != null) {
            tx.from = ro.from;
        }
        if (ro.type != null) {
            tx.type = ro.type;
        }
        if (ro.accessList != null) {
            tx.accessList = accessListify(ro.accessList);
        }
        if (ro.nodeId != null) {
            tx.nodeId = ro.nodeId;
        }
        // If there was no "gasLimit" override, but the ABI specifies a default, use it
        if (tx.gasLimit == null && fragment.gas != null) {
            let intrinsic = 21000;
            let contractCreationExtraGasCost = 11000;
            const bytes = arrayify(data);
            for (let i = 0; i < bytes.length; i++) {
                intrinsic += 4;
                if (bytes[i]) {
                    intrinsic += 16;
                }
            }
            const txGas = tx.to != null ? intrinsic : intrinsic + contractCreationExtraGasCost;
            tx.gasLimit = BigNumber.from(fragment.gas).add(txGas);
        }
        // Populate "value" override
        if (ro.value) {
            const roValue = BigNumber.from(ro.value);
            if (!roValue.isZero() && !fragment.payable) {
                logger.throwError("non-payable method cannot override value", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "overrides.value",
                    value: overrides.value
                });
            }
            tx.value = roValue;
        }
        if (ro.customData) {
            tx.customData = shallowCopy(ro.customData);
        }
        // Remove the overrides
        delete overrides.gasLimit;
        delete overrides.from;
        delete overrides.value;
        delete overrides.type;
        delete overrides.accessList;
        delete overrides.maxFeePerGas;
        delete overrides.maxPriorityFeePerGas;
        delete overrides.customData;
        delete overrides.nodeId;
        // Make sure there are no stray overrides, which may indicate a
        // typo or using an unsupported key.
        const leftovers = Object.keys(overrides).filter((key) => (overrides[key] != null));
        if (leftovers.length) {
            logger.throwError(`cannot override ${leftovers.map((l) => JSON.stringify(l)).join(",")}`, Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "overrides",
                overrides: leftovers
            });
        }
        return tx;
    });
}
function buildPopulate(contract, fragment) {
    return function (...args) {
        return populateTransaction(contract, fragment, args);
    };
}
// @ts-ignore
function buildEstimate(contract, fragment) {
    const signerOrProvider = (contract.signer || contract.provider);
    return function (...args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!signerOrProvider) {
                logger.throwError("estimate require a provider or signer", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "estimateGas"
                });
            }
            const tx = yield populateTransaction(contract, fragment, args);
            return yield signerOrProvider.estimateGas(tx);
        });
    };
}
function addContractWait(contract, tx) {
    const wait = tx.wait.bind(tx);
    tx.wait = (timeout) => {
        return wait(timeout).then((receipt) => {
            receipt.events = receipt.logs.map((log) => {
                let event = deepCopy(log);
                let parsed = null;
                try {
                    parsed = contract.interface.parseLog(log);
                }
                catch (e) { }
                // Successfully parsed the event log; include it
                if (parsed) {
                    event.args = parsed.args;
                    event.decode = (data, topics) => {
                        return contract.interface.decodeEventLog(parsed.eventFragment, data, topics);
                    };
                    event.event = parsed.name;
                    event.eventSignature = parsed.signature;
                }
                // Useful operations
                event.removeListener = () => { return contract.provider; };
                event.getTransaction = () => {
                    return contract.provider.getTransaction(receipt.transactionId);
                };
                event.getTransactionReceipt = () => {
                    return Promise.resolve(receipt);
                };
                return event;
            });
            return receipt;
        });
    };
}
function buildCall(contract, fragment, collapseSimple) {
    const signer = contract.signer;
    return function (...args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (args.length === fragment.inputs.length + 1 && typeof (args[args.length - 1]) === "object") {
                const overrides = shallowCopy(args.pop());
                args.push(overrides);
            }
            // If the contract was just deployed, wait until it is mined
            if (contract.deployTransaction != null) {
                yield contract._deployed();
            }
            // Call a node and get the result
            const tx = yield populateTransaction(contract, fragment, args);
            const result = yield signer.call(tx);
            try {
                let value = contract.interface.decodeFunctionResult(fragment, result);
                if (collapseSimple && fragment.outputs.length === 1) {
                    value = value[0];
                }
                return value;
            }
            catch (error) {
                if (error.code === Logger.errors.CALL_EXCEPTION) {
                    error.address = contract.address;
                    error.args = args;
                    error.transaction = tx;
                }
                throw error;
            }
        });
    };
}
function buildSend(contract, fragment) {
    return function (...args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!contract.signer) {
                logger.throwError("sending a transaction requires a signer", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "sendTransaction"
                });
            }
            // If the contract was just deployed, wait until it is mined
            if (contract.deployTransaction != null) {
                yield contract._deployed();
            }
            const txRequest = yield populateTransaction(contract, fragment, args);
            const tx = yield contract.signer.sendTransaction(txRequest);
            // Tweak the tx.wait so the receipt has extra properties
            addContractWait(contract, tx);
            return tx;
        });
    };
}
function buildDefault(contract, fragment, collapseSimple) {
    if (fragment.constant) {
        return buildCall(contract, fragment, collapseSimple);
    }
    return buildSend(contract, fragment);
}
function getEventTag(filter) {
    if (filter.address && (filter.topics == null || filter.topics.length === 0)) {
        return "*";
    }
    return (filter.address || "*") + "@" + (filter.topics ? filter.topics.map((topic) => {
        if (Array.isArray(topic)) {
            return topic.join("|");
        }
        return topic;
    }).join(":") : "");
}
class RunningEvent {
    constructor(tag, filter) {
        defineReadOnly(this, "tag", tag);
        defineReadOnly(this, "filter", filter);
        this._listeners = [];
    }
    addListener(listener, once) {
        this._listeners.push({ listener: listener, once: once });
    }
    removeListener(listener) {
        let done = false;
        this._listeners = this._listeners.filter((item) => {
            if (done || item.listener !== listener) {
                return true;
            }
            done = true;
            return false;
        });
    }
    removeAllListeners() {
        this._listeners = [];
    }
    listeners() {
        return this._listeners.map((i) => i.listener);
    }
    listenerCount() {
        return this._listeners.length;
    }
    run(args) {
        const listenerCount = this.listenerCount();
        this._listeners = this._listeners.filter((item) => {
            const argsCopy = args.slice();
            // Call the callback in the next event loop
            setTimeout(() => {
                item.listener.apply(this, argsCopy);
            }, 0);
            // Reschedule it if it not "once"
            return !(item.once);
        });
        return listenerCount;
    }
    prepareEvent(event) {
    }
    // Returns the array that will be applied to an emit
    getEmit(event) {
        return [event];
    }
}
class ErrorRunningEvent extends RunningEvent {
    constructor() {
        super("error", null);
    }
}
// @TODO Fragment should inherit Wildcard? and just override getEmit?
//       or have a common abstract super class, with enough constructor
//       options to configure both.
// A Fragment Event will populate all the properties that Wildcard
// will, and additionally dereference the arguments when emitting
class FragmentRunningEvent extends RunningEvent {
    constructor(address, contractInterface, fragment, topics) {
        const filter = {
            address: address
        };
        let topic = contractInterface.getEventTopic(fragment);
        if (topics) {
            if (topic !== topics[0]) {
                logger.throwArgumentError("topic mismatch", "topics", topics);
            }
            filter.topics = topics.slice();
        }
        else {
            filter.topics = [topic];
        }
        super(getEventTag(filter), filter);
        defineReadOnly(this, "address", address);
        defineReadOnly(this, "interface", contractInterface);
        defineReadOnly(this, "fragment", fragment);
    }
    prepareEvent(event) {
        super.prepareEvent(event);
        event.event = this.fragment.name;
        event.eventSignature = this.fragment.format();
        event.decode = (data, topics) => {
            return this.interface.decodeEventLog(this.fragment, data, topics);
        };
        try {
            event.args = this.interface.decodeEventLog(this.fragment, event.data, event.topics);
        }
        catch (error) {
            event.args = null;
            event.decodeError = error;
        }
    }
    getEmit(event) {
        const errors = checkResultErrors(event.args);
        if (errors.length) {
            throw errors[0].error;
        }
        const args = (event.args || []).slice();
        args.push(event);
        return args;
    }
}
// A Wildcard Event will attempt to populate:
//  - event            The name of the event name
//  - eventSignature   The full signature of the event
//  - decode           A function to decode data and topics
//  - args             The decoded data and topics
class WildcardRunningEvent extends RunningEvent {
    constructor(address, contractInterface) {
        super("*", { address: address });
        defineReadOnly(this, "address", address);
        defineReadOnly(this, "interface", contractInterface);
    }
    prepareEvent(event) {
        super.prepareEvent(event);
        try {
            const parsed = this.interface.parseLog(event);
            event.event = parsed.name;
            event.eventSignature = parsed.signature;
            event.decode = (data, topics) => {
                return this.interface.decodeEventLog(parsed.eventFragment, data, topics);
            };
            event.args = parsed.args;
        }
        catch (error) {
            // No matching event
        }
    }
}
export class BaseContract {
    constructor(address, contractInterface, signerOrProvider) {
        logger.checkNew(new.target, Contract);
        if (address) {
            this.address = getAddressFromAccount(address);
        }
        defineReadOnly(this, "interface", getStatic(new.target, "getInterface")(contractInterface));
        if (signerOrProvider == null) {
            defineReadOnly(this, "provider", null);
            defineReadOnly(this, "signer", null);
        }
        else if (Signer.isSigner(signerOrProvider)) {
            defineReadOnly(this, "provider", signerOrProvider.provider || null);
            defineReadOnly(this, "signer", signerOrProvider);
        }
        else if (Provider.isProvider(signerOrProvider)) {
            defineReadOnly(this, "provider", signerOrProvider);
            defineReadOnly(this, "signer", null);
        }
        else {
            logger.throwArgumentError("invalid signer or provider", "signerOrProvider", signerOrProvider);
        }
        defineReadOnly(this, "callStatic", {});
        defineReadOnly(this, "functions", {});
        defineReadOnly(this, "populateTransaction", {});
        defineReadOnly(this, "filters", {});
        {
            const uniqueFilters = {};
            Object.keys(this.interface.events).forEach((eventSignature) => {
                const event = this.interface.events[eventSignature];
                defineReadOnly(this.filters, eventSignature, (...args) => {
                    return {
                        address: this.address,
                        topics: this.interface.encodeFilterTopics(event, args)
                    };
                });
                if (!uniqueFilters[event.name]) {
                    uniqueFilters[event.name] = [];
                }
                uniqueFilters[event.name].push(eventSignature);
            });
            Object.keys(uniqueFilters).forEach((name) => {
                const filters = uniqueFilters[name];
                if (filters.length === 1) {
                    defineReadOnly(this.filters, name, this.filters[filters[0]]);
                }
                else {
                    logger.warn(`Duplicate definition of ${name} (${filters.join(", ")})`);
                }
            });
        }
        defineReadOnly(this, "_runningEvents", {});
        defineReadOnly(this, "_wrappedEmits", {});
        const uniqueNames = {};
        const uniqueSignatures = {};
        Object.keys(this.interface.functions).forEach((signature) => {
            const fragment = this.interface.functions[signature];
            // Check that the signature is unique; if not the ABI generation has
            // not been cleaned or may be incorrectly generated
            if (uniqueSignatures[signature]) {
                logger.warn(`Duplicate ABI entry for ${JSON.stringify(signature)}`);
                return;
            }
            uniqueSignatures[signature] = true;
            // Track unique names; we only expose bare named functions if they
            // are ambiguous
            {
                const name = fragment.name;
                if (!uniqueNames[`%${name}`]) {
                    uniqueNames[`%${name}`] = [];
                }
                uniqueNames[`%${name}`].push(signature);
            }
            if (this[signature] == null) {
                defineReadOnly(this, signature, buildDefault(this, fragment, true));
            }
            // We do not collapse simple calls on this bucket, which allows
            // frameworks to safely use this without introspection as well as
            // allows decoding error recovery.
            if (this.functions[signature] == null) {
                defineReadOnly(this.functions, signature, buildDefault(this, fragment, false));
            }
            if (this.callStatic[signature] == null) {
                defineReadOnly(this.callStatic, signature, buildCall(this, fragment, true));
            }
            if (this.populateTransaction[signature] == null) {
                defineReadOnly(this.populateTransaction, signature, buildPopulate(this, fragment));
            }
        });
        Object.keys(uniqueNames).forEach((name) => {
            // Ambiguous names to not get attached as bare names
            const signatures = uniqueNames[name];
            if (signatures.length > 1) {
                return;
            }
            // Strip off the leading "%" used for prototype protection
            name = name.substring(1);
            const signature = signatures[0];
            // If overwriting a member property that is null, swallow the error
            try {
                if (this[name] == null) {
                    defineReadOnly(this, name, this[signature]);
                }
            }
            catch (e) { }
            if (this.functions[name] == null) {
                defineReadOnly(this.functions, name, this.functions[signature]);
            }
            if (this.callStatic[name] == null) {
                defineReadOnly(this.callStatic, name, this.callStatic[signature]);
            }
            if (this.populateTransaction[name] == null) {
                defineReadOnly(this.populateTransaction, name, this.populateTransaction[signature]);
            }
        });
    }
    set address(val) {
        this._address = getAddressFromAccount(val);
    }
    get address() {
        return this._address;
    }
    static getInterface(contractInterface) {
        if (Interface.isInterface(contractInterface)) {
            return contractInterface;
        }
        return new Interface(contractInterface);
    }
    // @TODO: Allow timeout?
    deployed() {
        return this._deployed();
    }
    _deployed() {
        if (!this._deployedPromise) {
            // If we were just deployed, we know the transaction we should occur in
            if (this.deployTransaction) {
                this._deployedPromise = this.deployTransaction.wait().then(() => {
                    return this;
                });
            }
            else {
                // @TODO: Once we allow a timeout to be passed in, we will wait
                // up to that many blocks for getCode
                // Otherwise, poll for our code to be deployed
                this._deployedPromise = this.provider.getCode(this.address).then((code) => {
                    if (code === "0x") {
                        logger.throwError("contract not deployed", Logger.errors.UNSUPPORTED_OPERATION, {
                            contractAddress: this._address,
                            operation: "getDeployed"
                        });
                    }
                    return this;
                });
            }
        }
        return this._deployedPromise;
    }
    // @TODO:
    // estimateFallback(overrides?: TransactionRequest): Promise<BigNumber>
    // @TODO:
    // estimateDeploy(bytecode: string, ...args): Promise<BigNumber>
    fallback(overrides) {
        if (!this.signer) {
            logger.throwError("sending a transactions require a signer", Logger.errors.UNSUPPORTED_OPERATION, { operation: "sendTransaction(fallback)" });
        }
        const tx = shallowCopy(overrides || {});
        ["from", "to"].forEach(function (key) {
            if (tx[key] == null) {
                return;
            }
            logger.throwError("cannot override " + key, Logger.errors.UNSUPPORTED_OPERATION, { operation: key });
        });
        tx.to = this.resolvedAddress;
        return this.deployed().then(() => {
            return this.signer.sendTransaction(tx);
        });
    }
    // Reconnect to a different signer or provider
    connect(signerOrProvider) {
        if (typeof (signerOrProvider) === "string") {
            signerOrProvider = new VoidSigner(signerOrProvider, this.provider);
        }
        const contract = new (this.constructor)(this.address, this.interface, signerOrProvider);
        if (this.deployTransaction) {
            defineReadOnly(contract, "deployTransaction", this.deployTransaction);
        }
        return contract;
    }
    // Re-attach to a different on-chain instance of this contract
    attach(addressOrName) {
        return new (this.constructor)(addressOrName, this.interface, this.signer || this.provider);
    }
    static isIndexed(value) {
        return Indexed.isIndexed(value);
    }
    _normalizeRunningEvent(runningEvent) {
        // Already have an instance of this event running; we can re-use it
        if (this._runningEvents[runningEvent.tag]) {
            return this._runningEvents[runningEvent.tag];
        }
        return runningEvent;
    }
    _getRunningEvent(eventName) {
        if (typeof (eventName) === "string") {
            // Listen for "error" events (if your contract has an error event, include
            // the full signature to bypass this special event keyword)
            if (eventName === "error") {
                return this._normalizeRunningEvent(new ErrorRunningEvent());
            }
            // Listen for any event that is registered
            if (eventName === "event") {
                return this._normalizeRunningEvent(new RunningEvent("event", null));
            }
            // Listen for any event
            if (eventName === "*") {
                return this._normalizeRunningEvent(new WildcardRunningEvent(this.address, this.interface));
            }
            // Get the event Fragment (throws if ambiguous/unknown event)
            const fragment = this.interface.getEvent(eventName);
            return this._normalizeRunningEvent(new FragmentRunningEvent(this.address, this.interface, fragment));
        }
        // We have topics to filter by...
        if (eventName.topics && eventName.topics.length > 0) {
            // Is it a known topichash? (throws if no matching topichash)
            try {
                const topic = eventName.topics[0];
                if (typeof (topic) !== "string") {
                    throw new Error("invalid topic"); // @TODO: May happen for anonymous events
                }
                const fragment = this.interface.getEvent(topic);
                return this._normalizeRunningEvent(new FragmentRunningEvent(this.address, this.interface, fragment, eventName.topics));
            }
            catch (error) { }
            // Filter by the unknown topichash
            const filter = {
                address: this.address,
                topics: eventName.topics
            };
            return this._normalizeRunningEvent(new RunningEvent(getEventTag(filter), filter));
        }
        return this._normalizeRunningEvent(new WildcardRunningEvent(this.address, this.interface));
    }
    _requireAddressSet() {
        if (!this.address || this.address == "") {
            logger.throwArgumentError("Missing address", Logger.errors.INVALID_ARGUMENT, this.address);
        }
    }
    _checkRunningEvents(runningEvent) {
        if (runningEvent.listenerCount() === 0) {
            delete this._runningEvents[runningEvent.tag];
            // If we have a poller for this, remove it
            const emit = this._wrappedEmits[runningEvent.tag];
            if (emit && runningEvent.filter) {
                this.provider.off(runningEvent.filter, emit);
                delete this._wrappedEmits[runningEvent.tag];
            }
        }
    }
    // Subclasses can override this to gracefully recover
    // from parse errors if they wish
    _wrapEvent(runningEvent, log, listener) {
        const event = deepCopy(log);
        event.removeListener = () => {
            if (!listener) {
                return;
            }
            runningEvent.removeListener(listener);
            this._checkRunningEvents(runningEvent);
        };
        event.getTransaction = () => {
            return this.provider.getTransaction(log.timestamp);
        };
        event.getTransactionReceipt = () => {
            return logger.throwError("NOT_SUPPORTED", Logger.errors.UNSUPPORTED_OPERATION);
        };
        // This may throw if the topics and data mismatch the signature
        runningEvent.prepareEvent(event);
        return event;
    }
    _addEventListener(runningEvent, listener, once) {
        if (!this.provider) {
            logger.throwError("events require a provider or a signer with a provider", Logger.errors.UNSUPPORTED_OPERATION, { operation: "once" });
        }
        runningEvent.addListener(listener, once);
        // Track this running event and its listeners (may already be there; but no hard in updating)
        this._runningEvents[runningEvent.tag] = runningEvent;
        // If we are not polling the provider, start polling
        if (!this._wrappedEmits[runningEvent.tag]) {
            const wrappedEmit = (log) => {
                let event = this._wrapEvent(runningEvent, log, listener);
                // Try to emit the result for the parameterized event...
                if (event.decodeError == null) {
                    try {
                        const args = runningEvent.getEmit(event);
                        this.emit(runningEvent.filter, ...args);
                    }
                    catch (error) {
                        event.decodeError = error.error;
                    }
                }
                // Always emit "event" for fragment-base events
                if (runningEvent.filter != null) {
                    this.emit("event", event);
                }
                // Emit "error" if there was an error
                if (event.decodeError != null) {
                    this.emit("error", event.decodeError, event);
                }
            };
            this._wrappedEmits[runningEvent.tag] = wrappedEmit;
            // Special events, like "error" do not have a filter
            if (runningEvent.filter != null) {
                this.provider.on(runningEvent.filter, wrappedEmit);
            }
        }
    }
    queryFilter(event, fromTimestamp, toTimestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._requireAddressSet();
            const runningEvent = this._getRunningEvent(event);
            const filter = shallowCopy(runningEvent.filter);
            if (fromTimestamp) {
                filter.fromTimestamp = composeHederaTimestamp(fromTimestamp);
            }
            if (toTimestamp) {
                filter.toTimestamp = composeHederaTimestamp(toTimestamp);
            }
            const logs = yield this.provider.getLogs(filter);
            return logs.map((log) => this._wrapEvent(runningEvent, log, null));
        });
    }
    on(event, listener) {
        this._requireAddressSet();
        this._addEventListener(this._getRunningEvent(event), listener, false);
        return this;
    }
    once(event, listener) {
        this._requireAddressSet();
        this._addEventListener(this._getRunningEvent(event), listener, true);
        return this;
    }
    emit(eventName, ...args) {
        if (!this.provider) {
            return false;
        }
        this._requireAddressSet();
        const runningEvent = this._getRunningEvent(eventName);
        const result = (runningEvent.run(args) > 0);
        // May have drained all the "once" events; check for living events
        this._checkRunningEvents(runningEvent);
        return result;
    }
    listenerCount(eventName) {
        if (!this.provider) {
            return 0;
        }
        this._requireAddressSet();
        if (eventName == null) {
            return Object.keys(this._runningEvents).reduce((accum, key) => {
                return accum + this._runningEvents[key].listenerCount();
            }, 0);
        }
        return this._getRunningEvent(eventName).listenerCount();
    }
    listeners(eventName) {
        if (!this.provider) {
            return [];
        }
        this._requireAddressSet();
        if (eventName == null) {
            const result = [];
            for (let tag in this._runningEvents) {
                this._runningEvents[tag].listeners().forEach((listener) => {
                    result.push(listener);
                });
            }
            return result;
        }
        return this._getRunningEvent(eventName).listeners();
    }
    removeAllListeners(eventName) {
        if (!this.provider) {
            return this;
        }
        this._requireAddressSet();
        if (eventName == null) {
            for (const tag in this._runningEvents) {
                const runningEvent = this._runningEvents[tag];
                runningEvent.removeAllListeners();
                this._checkRunningEvents(runningEvent);
            }
            return this;
        }
        // Delete any listeners
        const runningEvent = this._getRunningEvent(eventName);
        runningEvent.removeAllListeners();
        this._checkRunningEvents(runningEvent);
        return this;
    }
    off(eventName, listener) {
        if (!this.provider) {
            return this;
        }
        this._requireAddressSet();
        const runningEvent = this._getRunningEvent(eventName);
        runningEvent.removeListener(listener);
        this._checkRunningEvents(runningEvent);
        return this;
    }
    removeListener(eventName, listener) {
        this._requireAddressSet();
        return this.off(eventName, listener);
    }
}
export class Contract extends BaseContract {
}
export class ContractFactory {
    constructor(contractInterface, bytecode, signer) {
        let bytecodeHex = null;
        if (typeof (bytecode) === "string") {
            bytecodeHex = bytecode;
        }
        else if (isBytes(bytecode)) {
            bytecodeHex = hexlify(bytecode);
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
        if (!isHexString(bytecodeHex) || (bytecodeHex.length % 2)) {
            logger.throwArgumentError("invalid bytecode", "bytecode", bytecode);
        }
        // If we have a signer, make sure it is valid
        if (signer && !Signer.isSigner(signer)) {
            logger.throwArgumentError("invalid signer", "signer", signer);
        }
        defineReadOnly(this, "bytecode", bytecodeHex);
        defineReadOnly(this, "interface", getStatic(new.target, "getInterface")(contractInterface));
        defineReadOnly(this, "signer", signer || null);
    }
    getDeployTransaction(...args) {
        let contractCreateTx = {};
        if (args.length === this.interface.deploy.inputs.length + 1 && typeof (args[args.length - 1]) === "object") {
            contractCreateTx = shallowCopy(args.pop());
            for (const key in contractCreateTx) {
                if (!allowedTransactionKeys[key]) {
                    throw new Error("unknown transaction override " + key);
                }
            }
        }
        // Allow only these to be overwritten in a deployment transaction
        Object.keys(contractCreateTx).forEach((key) => {
            if (["gasLimit", "value"].indexOf(key) > -1) {
                return;
            }
            logger.throwError("cannot override " + key, Logger.errors.UNSUPPORTED_OPERATION, { operation: key });
        });
        if (contractCreateTx.value) {
            const value = BigNumber.from(contractCreateTx.value);
            if (!value.isZero() && !this.interface.deploy.payable) {
                logger.throwError("non-payable constructor cannot override value", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "overrides.value",
                    value: contractCreateTx.value
                });
            }
        }
        // Make sure the call matches the constructor signature
        logger.checkArgumentCount(args.length, this.interface.deploy.inputs.length, " in Contract constructor");
        contractCreateTx = Object.assign(Object.assign({}, contractCreateTx), { data: hexlify(concat([
                this.bytecode,
                this.interface.encodeDeploy(args)
            ])), customData: {} });
        return contractCreateTx;
    }
    deploy(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let overrides = {};
            // If 1 extra parameter was passed in, it contains overrides
            if (args.length === this.interface.deploy.inputs.length + 1) {
                overrides = args.pop();
            }
            // Make sure the call matches the constructor signature
            logger.checkArgumentCount(args.length, this.interface.deploy.inputs.length, " in Contract constructor");
            args.push(overrides);
            // Get the deployment transaction (with optional overrides)
            const contractCreate = this.getDeployTransaction(...args);
            const contractCreateResponse = yield this.signer.sendTransaction(contractCreate);
            const address = contractCreateResponse.customData.contractId;
            const contract = getStatic(this.constructor, "getContract")(address, this.interface, this.signer);
            // Add the modified wait that wraps events
            addContractWait(contract, contractCreateResponse);
            defineReadOnly(contract, "deployTransaction", contractCreateResponse);
            return contract;
        });
    }
    attach(address) {
        return new (this.constructor).getContract(address, this.interface, this.signer);
    }
    connect(signer) {
        return new (this.constructor)(this.interface, this.bytecode, signer);
    }
    static fromSolidity(compilerOutput, signer) {
        if (compilerOutput == null) {
            logger.throwError("missing compiler output", Logger.errors.MISSING_ARGUMENT, { argument: "compilerOutput" });
        }
        if (typeof (compilerOutput) === "string") {
            compilerOutput = JSON.parse(compilerOutput);
        }
        const abi = compilerOutput.abi;
        let bytecode = null;
        if (compilerOutput.bytecode) {
            bytecode = compilerOutput.bytecode;
        }
        else if (compilerOutput.evm && compilerOutput.evm.bytecode) {
            bytecode = compilerOutput.evm.bytecode;
        }
        return new this(abi, bytecode, signer);
    }
    static getInterface(contractInterface) {
        return Contract.getInterface(contractInterface);
    }
    static getContract(address, contractInterface, signer) {
        return new Contract(address, contractInterface, signer);
    }
}
//# sourceMappingURL=index.js.map