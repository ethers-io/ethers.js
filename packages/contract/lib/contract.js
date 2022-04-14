var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PreparedTopicFilter_filter;
import { resolveAddress } from "@ethersproject/address";
import { Interface, Typed } from "@ethersproject/abi";
import { isHexString } from "@ethersproject/bytes";
import { isCallException } from "@ethersproject/logger";
import { defineProperties, resolveProperties } from "@ethersproject/properties";
import { copyRequest } from "@ethersproject/providers";
import { ContractEventPayload, ContractTransactionResponse, EventLog } from "./wrappers.js";
import { logger } from "./logger.js";
function canEstimate(value) {
    return (value && typeof (value.estimateGas) === "function");
}
function canCall(value) {
    return (value && typeof (value.call) === "function");
}
function canSend(value) {
    return (value && typeof (value.sendTransaction) === "function");
}
function canResolve(value) {
    return (value && typeof (value.resolveName) === "function");
}
function canQuery(value) {
    return (value && typeof (value.getLogs) === "function");
}
function canSubscribe(value) {
    return (value && typeof (value.on) === "function" && typeof (value.off) === "function");
}
function concisify(items) {
    items = Array.from((new Set(items)).values());
    items.sort();
    return items;
}
class PreparedTopicFilter {
    constructor(contract, fragment, args) {
        _PreparedTopicFilter_filter.set(this, void 0);
        defineProperties(this, { fragment });
        if (fragment.inputs.length < args.length) {
            throw new Error("too many arguments");
        }
        // Recursively descend into args and resolve any addresses
        const runner = getRunner(contract.runner, "resolveName");
        const resolver = canResolve(runner) ? runner : null;
        __classPrivateFieldSet(this, _PreparedTopicFilter_filter, (async function () {
            const resolvedArgs = await Promise.all(fragment.inputs.map((param, index) => {
                return param.walkAsync(args[index], (type, value) => {
                    if (type === "address") {
                        return resolveAddress(value, resolver);
                    }
                    return value;
                });
            }));
            return contract.interface.encodeFilterTopics(fragment, resolvedArgs);
        })(), "f");
    }
    getTopicFilter() {
        return __classPrivateFieldGet(this, _PreparedTopicFilter_filter, "f");
    }
}
_PreparedTopicFilter_filter = new WeakMap();
// A = Arguments passed in as a tuple
// R = The result type of the call (i.e. if only one return type,
//     the qualified type, otherwise Result)
// D = The type the default call will return (i.e. R for view/pure,
//     TransactionResponse otherwise)
//export interface ContractMethod<A extends Array<any> = Array<any>, R = any, D extends R | ContractTransactionResponse = ContractTransactionResponse> {
function _WrappedMethodBase() {
    return Function;
}
function getRunner(value, feature) {
    if (value == null) {
        return null;
    }
    if (typeof (value[feature]) === "function") {
        return value;
    }
    if (value.provider && typeof (value.provider[feature]) === "function") {
        return value.provider;
    }
    return null;
}
export async function copyOverrides(arg) {
    // Create a shallow copy (we'll deep-ify anything needed during normalizing)
    const overrides = copyRequest(Typed.dereference(arg, "overrides"));
    // Some sanity checking; these are what these methods adds
    //if ((<any>overrides).to) {
    if (overrides.to) {
        logger.throwArgumentError("cannot override to", "overrides.to", overrides.to);
    }
    else if (overrides.data) {
        logger.throwArgumentError("cannot override data", "overrides.data", overrides.data);
    }
    // Resolve any from
    if (overrides.from) {
        overrides.from = await resolveAddress(overrides.from);
    }
    return overrides;
}
export async function resolveArgs(_runner, inputs, args) {
    // Recursively descend into args and resolve any addresses
    const runner = getRunner(_runner, "resolveName");
    const resolver = canResolve(runner) ? runner : null;
    return await Promise.all(inputs.map((param, index) => {
        return param.walkAsync(args[index], (type, value) => {
            if (type === "address") {
                return resolveAddress(value, resolver);
            }
            return value;
        });
    }));
}
class WrappedMethod extends _WrappedMethodBase() {
    constructor(contract, key) {
        super();
        defineProperties(this, {
            name: contract.interface.getFunctionName(key),
            _contract: contract, _key: key
        });
        const proxy = new Proxy(this, {
            // Perform the default operation for this fragment type
            apply: async (target, thisArg, args) => {
                const fragment = target.getFragment(...args);
                if (fragment.constant) {
                    return await target.staticCall(...args);
                }
                return await target.send(...args);
            },
        });
        return proxy;
    }
    // Only works on non-ambiguous keys (refined fragment is always non-ambiguous)
    get fragment() {
        return this._contract.interface.getFunction(this._key);
    }
    getFragment(...args) {
        return this._contract.interface.getFunction(this._key, args);
    }
    async populateTransaction(...args) {
        const fragment = this.getFragment(...args);
        // If an overrides was passed in, copy it and normalize the values
        let overrides = {};
        if (fragment.inputs.length + 1 === args.length) {
            overrides = await copyOverrides(args.pop());
        }
        if (fragment.inputs.length !== args.length) {
            throw new Error("internal error: fragment inputs doesn't match arguments; should not happen");
        }
        const resolvedArgs = await resolveArgs(this._contract.runner, fragment.inputs, args);
        return Object.assign({}, overrides, await resolveProperties({
            to: this._contract.getAddress(),
            data: this._contract.interface.encodeFunctionData(fragment, resolvedArgs)
        }));
    }
    async staticCall(...args) {
        const result = await this.staticCallResult(...args);
        if (result.length === 1) {
            return result[0];
        }
        return result;
    }
    async send(...args) {
        const runner = getRunner(this._contract.runner, "sendTransaction");
        if (!canSend(runner)) {
            return logger.throwError("contract runner does not support sending transactions", "UNSUPPORTED_OPERATION", {
                operation: "sendTransaction"
            });
        }
        const tx = await runner.sendTransaction(await this.populateTransaction(...args));
        const provider = getRunner(this._contract.runner, "getLogs");
        return new ContractTransactionResponse(this._contract.interface, provider, tx);
    }
    async estimateGas(...args) {
        const runner = getRunner(this._contract.runner, "estimateGas");
        if (!canEstimate(runner)) {
            return logger.throwError("contract runner does not support gas estimation", "UNSUPPORTED_OPERATION", {
                operation: "estimateGas"
            });
        }
        return await runner.estimateGas(await this.populateTransaction(...args));
    }
    async staticCallResult(...args) {
        const runner = getRunner(this._contract.runner, "call");
        if (!canCall(runner)) {
            return logger.throwError("contract runner does not support calling", "UNSUPPORTED_OPERATION", {
                operation: "call"
            });
        }
        const fragment = this.getFragment(...args);
        const tx = await this.populateTransaction(...args);
        let result = "0x";
        try {
            result = await runner.call(tx);
        }
        catch (error) {
            if (isCallException(error)) {
                throw this._contract.interface.makeError(fragment, error.data, tx);
            }
            throw error;
        }
        return this._contract.interface.decodeFunctionResult(fragment, result);
    }
}
function _WrappedEventBase() {
    return Function;
}
class WrappedEvent extends _WrappedEventBase() {
    constructor(contract, key) {
        super();
        defineProperties(this, {
            name: contract.interface.getEventName(key),
            _contract: contract, _key: key
        });
        return new Proxy(this, {
            // Perform the default operation for this fragment type
            apply: async (target, thisArg, args) => {
                return new PreparedTopicFilter(contract, target.getFragment(...args), args);
            },
        });
    }
    // Only works on non-ambiguous keys
    get fragment() {
        return this._contract.interface.getEvent(this._key);
    }
    getFragment(...args) {
        return this._contract.interface.getEvent(this._key, args);
    }
}
;
// The combination of TypeScrype, Private Fields and Proxies makes
// the world go boom; so we hide variables with some trickery keeping
// a symbol attached to each BaseContract which its sub-class (even
// via a Proxy) can reach and use to look up its internal values.
const internal = Symbol.for("_ethersInternal_contract");
const internalValues = new WeakMap();
function setInternal(contract, values) {
    internalValues.set(contract[internal], values);
}
function getInternal(contract) {
    return internalValues.get(contract[internal]);
}
function isDeferred(value) {
    return (value && typeof (value) === "object" && ("getTopicFilter" in value) &&
        (typeof (value.getTopicFilter) === "function") && value.fragment);
}
async function getSubTag(contract, event) {
    let fragment;
    let topics;
    if (Array.isArray(event)) {
        // Topics; e.g. `[ "0x1234...89ab" ]`
        fragment = contract.interface.getEvent(event[0]);
        topics = event;
    }
    else if (typeof (event) === "string") {
        // Event name (name or signature); `"Transfer"`
        fragment = contract.interface.getEvent(event);
        topics = [contract.interface.getEventTopic(fragment)];
    }
    else if (isDeferred(event)) {
        // Deferred Topic Filter; e.g. `contract.filter.Transfer(from)`
        fragment = event.fragment;
        topics = await event.getTopicFilter();
    }
    else if ("fragment" in event) {
        // ContractEvent; e.g. `contract.filter.Transfer`
        fragment = event.fragment;
        topics = [contract.interface.getEventTopic(fragment)];
    }
    else {
        console.log(event);
        throw new Error("TODO");
    }
    // Normalize topics and sort TopicSets
    topics = topics.map((t) => {
        if (t == null) {
            return null;
        }
        if (Array.isArray(t)) {
            return concisify(t.map((t) => t.toLowerCase()));
        }
        return t.toLowerCase();
    });
    const tag = topics.map((t) => {
        if (t == null) {
            return "null";
        }
        if (Array.isArray(t)) {
            return t.join("|");
        }
        return t;
    }).join("&");
    return { fragment, tag, topics };
}
async function hasSub(contract, event) {
    const { subs } = getInternal(contract);
    return subs.get((await getSubTag(contract, event)).tag) || null;
}
async function getSub(contract, event) {
    // Make sure our runner can actually subscribe to events
    const runner = getRunner(contract.runner, "on");
    const runnerOff = getRunner(contract.runner, "off");
    if (!runner || runner !== runnerOff || !canSubscribe(runner)) {
        return logger.throwError("contract runner does not support subscribing", "UNSUPPORTED_OPERATION", {
            operation: "on"
        });
    }
    const { fragment, tag, topics } = await getSubTag(contract, event);
    const { addr, subs } = getInternal(contract);
    let sub = subs.get(tag);
    if (!sub) {
        const address = (addr ? addr : contract);
        const filter = { address, topics };
        const listener = (log) => {
            const payload = new ContractEventPayload(contract, null, event, fragment, log);
            emit(contract, event, payload.args, payload);
        };
        let started = false;
        const start = () => {
            if (started) {
                return;
            }
            runner.on(filter, listener);
            started = true;
        };
        const stop = () => {
            if (!started) {
                return;
            }
            runner.off(filter, listener);
            started = false;
        };
        sub = { tag, listeners: [], start, stop };
        subs.set(tag, sub);
    }
    return sub;
}
async function _emit(contract, event, args, payload) {
    await lastEmit;
    const sub = await hasSub(contract, event);
    if (!sub) {
        return false;
    }
    const count = sub.listeners.length;
    sub.listeners = sub.listeners.filter(({ listener, once }) => {
        const passArgs = args.slice();
        if (payload) {
            passArgs.push(new ContractEventPayload(contract, (once ? null : listener), event, payload.fragment, payload.log));
        }
        try {
            listener.call(contract, ...passArgs);
        }
        catch (error) { }
        return !once;
    });
    return (count > 0);
}
// We use this to ensure one emit resolves before firing the next to
// ensure correct ordering (note this cannot throw and just adds the
// notice to the event queu using setTimeout).
let lastEmit = Promise.resolve();
async function emit(contract, event, args, payload) {
    try {
        await lastEmit;
    }
    catch (error) { }
    const resultPromise = _emit(contract, event, args, payload);
    lastEmit = resultPromise;
    return await resultPromise;
}
const passProperties = ["then"];
export class BaseContract {
    constructor(target, abi, runner = null, _deployTx) {
        const iface = Interface.from(abi);
        defineProperties(this, { target, runner, interface: iface });
        Object.defineProperty(this, internal, { value: {} });
        let addrPromise;
        let addr = null;
        let deployTx = null;
        if (_deployTx) {
            const provider = getRunner(runner, "getLogs");
            deployTx = new ContractTransactionResponse(this.interface, provider, _deployTx);
        }
        let subs = new Map();
        // Resolve the target as the address
        if (typeof (target) === "string") {
            if (isHexString(target)) {
                addr = target;
                addrPromise = Promise.resolve(target);
            }
            else {
                const resolver = getRunner(runner, "resolveName");
                if (!canResolve(resolver)) {
                    throw logger.makeError("contract runner does not support name resolution", "UNSUPPORTED_OPERATION", {
                        operation: "resolveName"
                    });
                }
                addrPromise = resolver.resolveName(target).then((addr) => {
                    if (addr == null) {
                        throw new Error("TODO");
                    }
                    getInternal(this).addr = addr;
                    return addr;
                });
            }
        }
        else {
            addrPromise = target.getAddress().then((addr) => {
                if (addr == null) {
                    throw new Error("TODO");
                }
                getInternal(this).addr = addr;
                return addr;
            });
        }
        // Set our private values
        setInternal(this, { addrPromise, addr, deployTx, subs });
        // Add the event filters
        const filters = new Proxy({}, {
            get: (target, _prop, receiver) => {
                // Pass important checks (like `then` for Promise) through
                if (passProperties.indexOf(_prop) >= 0) {
                    return Reflect.get(target, _prop, receiver);
                }
                const prop = String(_prop);
                const result = this.getEvent(prop);
                if (result) {
                    return result;
                }
                throw new Error(`unknown contract event: ${prop}`);
            }
        });
        defineProperties(this, { filters });
        // Return a Proxy that will respond to functions
        return new Proxy(this, {
            get: (target, _prop, receiver) => {
                if (_prop in target || passProperties.indexOf(_prop) >= 0) {
                    return Reflect.get(target, _prop, receiver);
                }
                const prop = String(_prop);
                const result = target.getFunction(prop);
                if (result) {
                    return result;
                }
                throw new Error(`unknown contract method: ${prop}`);
            }
        });
    }
    async getAddress() { return await getInternal(this).addrPromise; }
    deploymentTransaction() {
        return getInternal(this).deployTx;
    }
    getFunction(key) {
        if (typeof (key) !== "string") {
            key = key.format();
        }
        return (new WrappedMethod(this, key));
    }
    getEvent(key) {
        if (typeof (key) !== "string") {
            key = key.format();
        }
        return (new WrappedEvent(this, key));
    }
    async queryTransaction(hash) {
        // Is this useful?
        throw new Error("@TODO");
    }
    async queryFilter(event, fromBlock = 0, toBlock = "latest") {
        const { addr, addrPromise } = getInternal(this);
        const address = (addr ? addr : (await addrPromise));
        const { fragment, topics } = await getSubTag(this, event);
        const filter = { address, topics, fromBlock, toBlock };
        const runner = getRunner(this.runner, "getLogs");
        if (!canQuery(runner)) {
            return logger.throwError("contract runner does not support querying", "UNSUPPORTED_OPERATION", {
                operation: "getLogs"
            });
        }
        return (await runner.getLogs(filter)).map((log) => {
            return new EventLog(log, this.interface, fragment);
        });
    }
    async on(event, listener) {
        const sub = await getSub(this, event);
        sub.listeners.push({ listener, once: false });
        sub.start();
        return this;
    }
    async once(event, listener) {
        const sub = await getSub(this, event);
        sub.listeners.push({ listener, once: true });
        sub.start();
        return this;
    }
    async emit(event, ...args) {
        return await emit(this, event, args, null);
    }
    async listenerCount(event) {
        if (event) {
            const sub = await hasSub(this, event);
            if (!sub) {
                return 0;
            }
            return sub.listeners.length;
        }
        const { subs } = getInternal(this);
        let total = 0;
        for (const { listeners } of subs.values()) {
            total += listeners.length;
        }
        return total;
    }
    async listeners(event) {
        if (event) {
            const sub = await hasSub(this, event);
            if (!sub) {
                return [];
            }
            return sub.listeners.map(({ listener }) => listener);
        }
        const { subs } = getInternal(this);
        let result = [];
        for (const { listeners } of subs.values()) {
            result = result.concat(listeners.map(({ listener }) => listener));
        }
        return result;
    }
    async off(event, listener) {
        const sub = await hasSub(this, event);
        if (!sub) {
            return this;
        }
        if (listener) {
            const index = sub.listeners.map(({ listener }) => listener).indexOf(listener);
            if (index >= 0) {
                sub.listeners.splice(index, 1);
            }
        }
        if (listener == null || sub.listeners.length === 0) {
            sub.stop();
            getInternal(this).subs.delete(sub.tag);
        }
        return this;
    }
    async removeAllListeners(event) {
        if (event) {
            const sub = await hasSub(this, event);
            if (!sub) {
                return this;
            }
            sub.stop();
            getInternal(this).subs.delete(sub.tag);
        }
        else {
            const { subs } = getInternal(this);
            for (const { tag, stop } of subs.values()) {
                stop();
                subs.delete(tag);
            }
        }
        return this;
    }
    // Alias for "on"
    async addListener(event, listener) {
        return await this.on(event, listener);
    }
    // Alias for "off"
    async removeListener(event, listener) {
        return await this.off(event, listener);
    }
    static buildClass(abi) {
        class CustomContract extends BaseContract {
            constructor(address, runner = null) {
                super(address, abi, runner);
            }
        }
        return CustomContract;
    }
    ;
    static from(target, abi, runner = null) {
        const contract = new this(target, abi, runner);
        return contract;
    }
}
function _ContractBase() {
    return BaseContract;
}
export class Contract extends _ContractBase() {
}
//# sourceMappingURL=contract.js.map