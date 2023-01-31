import { Interface, Typed } from "../abi/index.js";
import { resolveAddress } from "../address/index.js";
// import from provider.ts instead of index.ts to prevent circular dep
// from EtherscanProvider
import { copyRequest, Log, TransactionResponse } from "../providers/provider.js";
import {
    defineProperties, isCallException, isHexString, resolveProperties,
    makeError, assert, assertArgument
} from "../utils/index.js";

import {
    ContractEventPayload, ContractUnknownEventPayload,
    ContractTransactionResponse,
    EventLog
} from "./wrappers.js";

import type { EventFragment, FunctionFragment, InterfaceAbi, ParamType, Result } from "../abi/index.js";
import type { Addressable } from "../address/index.js";
import type { EventEmitterable, Listener } from "../utils/index.js";
import type {
    BlockTag, ContractRunner, Provider, TransactionRequest, TopicFilter
} from "../providers/index.js";

import type {
    ContractEventName,
    ContractInterface,
    ContractMethodArgs,
    BaseContractMethod,
    ContractMethod,
    ContractEventArgs,
    ContractEvent,
    ContractTransaction,
    DeferredTopicFilter
} from "./types.js";

const BN_0 = BigInt(0);

interface ContractRunnerCaller extends ContractRunner {
    call: (tx: TransactionRequest) => Promise<string>;
}

interface ContractRunnerEstimater extends ContractRunner {
    estimateGas: (tx: TransactionRequest) => Promise<bigint>;
}

interface ContractRunnerSender extends ContractRunner {
    sendTransaction: (tx: TransactionRequest) => Promise<TransactionResponse>;
}

interface ContractRunnerResolver extends ContractRunner {
    resolveName: (name: string | Addressable) => Promise<null | string>;
}

function canCall(value: any): value is ContractRunnerCaller {
    return (value && typeof(value.call) === "function");
}

function canEstimate(value: any): value is ContractRunnerEstimater {
    return (value && typeof(value.estimateGas) === "function");
}

function canResolve(value: any): value is ContractRunnerResolver {
    return (value && typeof(value.resolveName) === "function");
}

function canSend(value: any): value is ContractRunnerSender {
    return (value && typeof(value.sendTransaction) === "function");
}

class PreparedTopicFilter implements DeferredTopicFilter {
    #filter: Promise<TopicFilter>;
    readonly fragment!: EventFragment;

    constructor(contract: BaseContract, fragment: EventFragment, args: Array<any>) {
        defineProperties<PreparedTopicFilter>(this, { fragment });
        if (fragment.inputs.length < args.length) {
            throw new Error("too many arguments");
        }

        // Recursively descend into args and resolve any addresses
        const runner = getRunner(contract.runner, "resolveName");
        const resolver = canResolve(runner) ? runner: null;
        this.#filter = (async function() {
            const resolvedArgs = await Promise.all(fragment.inputs.map((param, index) => {
                const arg = args[index];
                if (arg == null) { return null; }

                return param.walkAsync(args[index], (type, value) => {
                    if (type === "address") {
                        return resolveAddress(value, resolver);
                    }
                    return value;
                });
            }));

            return contract.interface.encodeFilterTopics(fragment, resolvedArgs);
        })();
    }

    getTopicFilter(): Promise<TopicFilter> {
        return this.#filter;
    }
}


// A = Arguments passed in as a tuple
// R = The result type of the call (i.e. if only one return type,
//     the qualified type, otherwise Result)
// D = The type the default call will return (i.e. R for view/pure,
//     TransactionResponse otherwise)
//export interface ContractMethod<A extends Array<any> = Array<any>, R = any, D extends R | ContractTransactionResponse = ContractTransactionResponse> {

function _WrappedMethodBase(): new () => Function & BaseContractMethod {
    return Function as any;
}

function getRunner<T extends ContractRunner>(value: any, feature: keyof ContractRunner): null | T {
    if (value == null) { return null; }
    if (typeof(value[feature]) === "function") { return value; }
    if (value.provider && typeof(value.provider[feature]) === "function") {
        return value.provider;
    }
    return null;
}

function getProvider(value: null | ContractRunner): null | Provider {
    if (value == null) { return null; }
    return value.provider || null;
}

/**
 *  @_ignore:
 */
export async function copyOverrides<O extends string = "data" | "to">(arg: any, allowed?: Array<string>): Promise<Omit<ContractTransaction, O>> {

    // Create a shallow copy (we'll deep-ify anything needed during normalizing)
    const overrides = copyRequest(Typed.dereference(arg, "overrides"));

    assertArgument(overrides.to == null || (allowed || [ ]).indexOf("to") >= 0,
      "cannot override to", "overrides.to", overrides.to);
    assertArgument(overrides.data == null || (allowed || [ ]).indexOf("data") >= 0,
      "cannot override data", "overrides.data", overrides.data);

    // Resolve any from
    if (overrides.from) {
        overrides.from = await resolveAddress(overrides.from);
    }

    return <Omit<ContractTransaction, O>>overrides;
}

/**
 *  @_ignore:
 */
export async function resolveArgs(_runner: null | ContractRunner, inputs: ReadonlyArray<ParamType>, args: Array<any>): Promise<Array<any>> {
    // Recursively descend into args and resolve any addresses
    const runner = getRunner(_runner, "resolveName");
    const resolver = canResolve(runner) ? runner: null;
    return await Promise.all(inputs.map((param, index) => {
        return param.walkAsync(args[index], (type, value) => {
            value = Typed.dereference(value, type);
            if (type === "address") { return resolveAddress(value, resolver); }
            return value;
        });
    }));
}

class WrappedFallback {
    readonly _contract!: BaseContract;

    constructor (contract: BaseContract) {
        defineProperties<WrappedFallback>(this, { _contract: contract });

        const proxy = new Proxy(this, {
            // Perform send when called
            apply: async (target, thisArg, args: Array<any>) => {
                return await target.send(...args);
            },
        });

        return proxy;
    }

    async populateTransaction(overrides?: Omit<TransactionRequest, "to">): Promise<ContractTransaction> {
        // If an overrides was passed in, copy it and normalize the values

        const tx: ContractTransaction = <any>(await copyOverrides<"data">(overrides, [ "data" ]));
        tx.to = await this._contract.getAddress();

        const iface = this._contract.interface;

        // Only allow payable contracts to set non-zero value
        const payable = iface.receive || (iface.fallback && iface.fallback.payable);
        assertArgument(payable || (tx.value || BN_0) === BN_0,
          "cannot send value to non-payable contract", "overrides.value", tx.value);

        // Only allow fallback contracts to set non-empty data
        assertArgument(iface.fallback || (tx.data || "0x") === "0x",
          "cannot send data to receive-only contract", "overrides.data", tx.data);

        return tx;
    }

    async staticCall(overrides?: Omit<TransactionRequest, "to">): Promise<string> {
        const runner = getRunner(this._contract.runner, "call");
        assert(canCall(runner), "contract runner does not support calling",
            "UNSUPPORTED_OPERATION", { operation: "call" });

        const tx = await this.populateTransaction(overrides);

        try {
            return await runner.call(tx);
        } catch (error: any) {
            if (isCallException(error) && error.data) {
                throw this._contract.interface.makeError(error.data, tx);
            }
            throw error;
        }
    }

    async send(overrides?: Omit<TransactionRequest, "to">): Promise<ContractTransactionResponse> {
        const runner = this._contract.runner;
        assert(canSend(runner), "contract runner does not support sending transactions",
            "UNSUPPORTED_OPERATION", { operation: "sendTransaction" });

        const tx = await runner.sendTransaction(await this.populateTransaction(overrides));
        const provider = getProvider(this._contract.runner);
        // @TODO: the provider can be null; make a custom dummy provider that will throw a
        // meaningful error
        return new ContractTransactionResponse(this._contract.interface, <Provider>provider, tx);
    }

    async estimateGas(overrides?: Omit<TransactionRequest, "to">): Promise<bigint> {
        const runner = getRunner(this._contract.runner, "estimateGas");
        assert(canEstimate(runner), "contract runner does not support gas estimation",
            "UNSUPPORTED_OPERATION", { operation: "estimateGas" });

        return await runner.estimateGas(await this.populateTransaction(overrides));
    }
}

class WrappedMethod<A extends Array<any> = Array<any>, R = any, D extends R | ContractTransactionResponse = ContractTransactionResponse>
  extends _WrappedMethodBase() implements BaseContractMethod<A, R, D> {

    readonly name: string = "";   // Investigate!
    readonly _contract!: BaseContract;
    readonly _key!: string;

    constructor (contract: BaseContract, key: string) {
        super();

        defineProperties<WrappedMethod>(this, {
            name: contract.interface.getFunctionName(key),
            _contract: contract, _key: key
        });

        const proxy = new Proxy(this, {
            // Perform the default operation for this fragment type
            apply: async (target, thisArg, args: ContractMethodArgs<A>) => {
                const fragment = target.getFragment(...args);
                if (fragment.constant) { return await target.staticCall(...args); }
                return await target.send(...args);
            },
        });

        return proxy;
    }

    // Only works on non-ambiguous keys (refined fragment is always non-ambiguous)
    get fragment(): FunctionFragment {
        const fragment = this._contract.interface.getFunction(this._key);
        assert(fragment, "no matching fragment", "UNSUPPORTED_OPERATION", {
            operation: "fragment"
        });
        return fragment;
    }

    getFragment(...args: ContractMethodArgs<A>): FunctionFragment {
        const fragment = this._contract.interface.getFunction(this._key, args);
        assert(fragment, "no matching fragment", "UNSUPPORTED_OPERATION", {
            operation: "fragment"
        });
        return fragment;
    }

    async populateTransaction(...args: ContractMethodArgs<A>): Promise<ContractTransaction> {
        const fragment = this.getFragment(...args);

        // If an overrides was passed in, copy it and normalize the values
        let overrides: Omit<ContractTransaction, "data" | "to"> = { };
        if (fragment.inputs.length + 1 === args.length) {
            overrides = await copyOverrides(args.pop());
        }

        if (fragment.inputs.length !== args.length) {
            throw new Error("internal error: fragment inputs doesn't match arguments; should not happen");
        }

        const resolvedArgs = await resolveArgs(this._contract.runner, fragment.inputs, args);

        return Object.assign({ }, overrides, await resolveProperties({
            to: this._contract.getAddress(),
            data: this._contract.interface.encodeFunctionData(fragment, resolvedArgs)
        }));
    }

    async staticCall(...args: ContractMethodArgs<A>): Promise<R> {
        const result = await this.staticCallResult(...args);
        if (result.length === 1) { return result[0]; }
        return <R><unknown>result;
    }

    async send(...args: ContractMethodArgs<A>): Promise<ContractTransactionResponse> {
        const runner = this._contract.runner;
        assert(canSend(runner), "contract runner does not support sending transactions",
            "UNSUPPORTED_OPERATION", { operation: "sendTransaction" });

        const tx = await runner.sendTransaction(await this.populateTransaction(...args));
        const provider = getProvider(this._contract.runner);
        // @TODO: the provider can be null; make a custom dummy provider that will throw a
        // meaningful error
        return new ContractTransactionResponse(this._contract.interface, <Provider>provider, tx);
    }

    async estimateGas(...args: ContractMethodArgs<A>): Promise<bigint> {
        const runner = getRunner(this._contract.runner, "estimateGas");
        assert(canEstimate(runner), "contract runner does not support gas estimation",
            "UNSUPPORTED_OPERATION", { operation: "estimateGas" });

        return await runner.estimateGas(await this.populateTransaction(...args));
    }

    async staticCallResult(...args: ContractMethodArgs<A>): Promise<Result> {
        const runner = getRunner(this._contract.runner, "call");
        assert(canCall(runner), "contract runner does not support calling",
            "UNSUPPORTED_OPERATION", { operation: "call" });

        const tx = await this.populateTransaction(...args);

        let result = "0x";
        try {
            result = await runner.call(tx);
        } catch (error: any) {
            if (isCallException(error) && error.data) {
                throw this._contract.interface.makeError(error.data, tx);
            }
            throw error;
        }

        const fragment = this.getFragment(...args);
        return this._contract.interface.decodeFunctionResult(fragment, result);
    }
}

function _WrappedEventBase(): new () => Function & ContractEvent {
    return Function as any;
}

class WrappedEvent<A extends Array<any> = Array<any>> extends _WrappedEventBase() implements ContractEvent<A> {
    readonly name: string = "";  // @TODO: investigate 

    readonly _contract!: BaseContract;
    readonly _key!: string;

    constructor (contract: BaseContract, key: string) {
        super();

        defineProperties<WrappedEvent>(this, {
            name: contract.interface.getEventName(key),
            _contract: contract, _key: key
        });

        return new Proxy(this, {
            // Perform the default operation for this fragment type
            apply: (target, thisArg, args: ContractEventArgs<A>) => {
                return new PreparedTopicFilter(contract, target.getFragment(...args), args);
            },
        });
    }

    // Only works on non-ambiguous keys
    get fragment(): EventFragment {
        const fragment = this._contract.interface.getEvent(this._key);

        assert(fragment, "no matching fragment", "UNSUPPORTED_OPERATION", {
            operation: "fragment"
        });

        return fragment;
    }

    getFragment(...args: ContractEventArgs<A>): EventFragment {
        const fragment = this._contract.interface.getEvent(this._key, args);

        assert(fragment, "no matching fragment", "UNSUPPORTED_OPERATION", {
            operation: "fragment"
        });

        return fragment;
    }
};

type Sub = {
    tag: string;
    listeners: Array<{ listener: Listener, once: boolean }>,
    start: () => void;
    stop: () => void;
};


// The combination of TypeScrype, Private Fields and Proxies makes
// the world go boom; so we hide variables with some trickery keeping
// a symbol attached to each BaseContract which its sub-class (even
// via a Proxy) can reach and use to look up its internal values.

const internal = Symbol.for("_ethersInternal_contract");
type Internal = {
    addrPromise: Promise<string>;
    addr: null | string;

    deployTx: null | ContractTransactionResponse;

    subs: Map<string, Sub>;
};

const internalValues: WeakMap<BaseContract, Internal> = new WeakMap();

function setInternal(contract: BaseContract, values: Internal): void {
    internalValues.set(contract[internal], values);
}

function getInternal(contract: BaseContract): Internal {
    return internalValues.get(contract[internal]) as Internal;
}

function isDeferred(value: any): value is DeferredTopicFilter {
    return (value && typeof(value) === "object" && ("getTopicFilter" in value) &&
      (typeof(value.getTopicFilter) === "function") && value.fragment);
}

async function getSubInfo(contract: BaseContract, event: ContractEventName): Promise<{ fragment: null | EventFragment, tag: string, topics: TopicFilter }> {
    let topics: Array<null | string | Array<string>>;
    let fragment: null | EventFragment = null;

    // Convert named events to topicHash and get the fragment for
    // events which need deconstructing.

    if (Array.isArray(event)) {
        const topicHashify = function(name: string): string {
            if (isHexString(name, 32)) { return name; }
            const fragment = contract.interface.getEvent(name);
            assertArgument(fragment, "unknown fragment", "name", name);
            return fragment.topicHash;
        }

        // Array of Topics and Names; e.g. `[ "0x1234...89ab", "Transfer(address)" ]`
        topics = event.map((e) => {
            if (e == null) { return null; }
            if (Array.isArray(e)) { return e.map(topicHashify); }
            return topicHashify(e);
        });

    } else if (event === "*") {
        topics = [ null ];

    } else if (typeof(event) === "string") {
        if (isHexString(event, 32)) {
            // Topic Hash
            topics = [ event ];
        } else {
           // Name or Signature; e.g. `"Transfer", `"Transfer(address)"`
            fragment = contract.interface.getEvent(event);
            assertArgument(fragment, "unknown fragment", "event", event);
            topics = [ fragment.topicHash ];
        }

    } else if (isDeferred(event)) {
        // Deferred Topic Filter; e.g. `contract.filter.Transfer(from)`
        topics = await event.getTopicFilter();

    } else if ("fragment" in event) {
        // ContractEvent; e.g. `contract.filter.Transfer`
        fragment = event.fragment;
        topics = [ fragment.topicHash ];

    } else {
        assertArgument(false, "unknown event name", "event", event);
    }

    // Normalize topics and sort TopicSets
    topics = topics.map((t) => {
        if (t == null) { return null; }
        if (Array.isArray(t)) {
            const items = Array.from(new Set(t.map((t) => t.toLowerCase())).values());
            if (items.length === 1) { return items[0]; }
            items.sort();
            return items;
        }
        return t.toLowerCase();
    });

    const tag = topics.map((t) => {
        if (t == null) { return "null"; }
        if (Array.isArray(t)) { return t.join("|"); }
        return t;
    }).join("&");

    return { fragment, tag, topics }
}

async function hasSub(contract: BaseContract, event: ContractEventName): Promise<null | Sub> {
    const { subs } = getInternal(contract);
    return subs.get((await getSubInfo(contract, event)).tag) || null;
}

async function getSub(contract: BaseContract, operation: string, event: ContractEventName): Promise<Sub> {
    // Make sure our runner can actually subscribe to events
    const provider = getProvider(contract.runner);
    assert(provider, "contract runner does not support subscribing",
        "UNSUPPORTED_OPERATION", { operation });

    const { fragment, tag, topics } = await getSubInfo(contract, event);

    const { addr, subs } = getInternal(contract);

    let sub = subs.get(tag);
    if (!sub) {
        const address: string | Addressable = (addr ? addr: contract);
        const filter = { address, topics };
        const listener = (log: Log) => {
            let foundFragment = fragment;
            if (foundFragment == null) {
                try {
                    foundFragment = contract.interface.getEvent(log.topics[0]);
                } catch (error) { }
            }

            // If fragment is null, we do not deconstruct the args to emit

            if (foundFragment) {
                const _foundFragment = foundFragment;
                const args = fragment ? contract.interface.decodeEventLog(fragment, log.data, log.topics): [ ];
                emit(contract, event, args, (listener: null | Listener) => {
                    return new ContractEventPayload(contract, listener, event, _foundFragment, log);
                });
            } else {
                emit(contract, event, [ ], (listener: null | Listener) => {
                    return new ContractUnknownEventPayload(contract, listener, event, log);
                });
            }
        };

        let starting: Array<Promise<any>> = [ ];
        const start = () => {
            if (starting.length) { return; }
            starting.push(provider.on(filter, listener));
        };

        const stop = async () => {
            if (starting.length == 0) { return; }

            let started = starting;
            starting = [ ];
            await Promise.all(started);
            provider.off(filter, listener);
        };

        sub = { tag, listeners: [ ], start, stop };
        subs.set(tag, sub);
    }
    return sub;
}

// We use this to ensure one emit resolves before firing the next to
// ensure correct ordering (note this cannot throw and just adds the
// notice to the event queu using setTimeout).
let lastEmit: Promise<any> = Promise.resolve();

type PayloadFunc = (listener: null | Listener) => ContractUnknownEventPayload;

async function _emit(contract: BaseContract, event: ContractEventName, args: Array<any>, payloadFunc: null | PayloadFunc): Promise<boolean> {
    await lastEmit;

    const sub = await hasSub(contract, event);
    if (!sub) { return false; }

    const count = sub.listeners.length;
    sub.listeners = sub.listeners.filter(({ listener, once }) => {
        const passArgs = args.slice();
        if (payloadFunc) {
            passArgs.push(payloadFunc(once ? null: listener));
        }
        try {
            listener.call(contract, ...passArgs);
        } catch (error) { }
        return !once;
    });
    return (count > 0);
}

async function emit(contract: BaseContract, event: ContractEventName, args: Array<any>, payloadFunc: null | PayloadFunc): Promise<boolean> {
    try {
        await lastEmit;
    } catch (error) { }

    const resultPromise = _emit(contract, event, args, payloadFunc);
    lastEmit = resultPromise;
    return await resultPromise;
}

const passProperties = [ "then" ];
export class BaseContract implements Addressable, EventEmitterable<ContractEventName> {
    readonly target!: string | Addressable;
    readonly interface!: Interface;
    readonly runner!: null | ContractRunner;

    readonly filters!: Record<string, ContractEvent>;

    readonly [internal]: any;

    readonly fallback!: null | WrappedFallback;

    constructor(target: string | Addressable, abi: Interface | InterfaceAbi, runner?: null | ContractRunner, _deployTx?: null | TransactionResponse) {
        if (runner == null) { runner = null; }
        const iface = Interface.from(abi);
        defineProperties<BaseContract>(this, { target, runner, interface: iface });

        Object.defineProperty(this, internal, { value: { } });

        let addrPromise;
        let addr = null;

        let deployTx: null | ContractTransactionResponse = null;
        if (_deployTx) {
            const provider = getProvider(runner);
            // @TODO: the provider can be null; make a custom dummy provider that will throw a
            // meaningful error
            deployTx = new ContractTransactionResponse(this.interface, <Provider>provider, _deployTx);
        }

        let subs = new Map();

        // Resolve the target as the address
        if (typeof(target) === "string") {
            if (isHexString(target)) {
                addr = target;
                addrPromise = Promise.resolve(target);

            } else {
                const resolver = getRunner(runner, "resolveName");
                if (!canResolve(resolver)) {
                    throw makeError("contract runner does not support name resolution", "UNSUPPORTED_OPERATION", {
                        operation: "resolveName"
                    });
                }

                addrPromise = resolver.resolveName(target).then((addr) => {
                    if (addr == null) { throw new Error("TODO"); }
                    getInternal(this).addr = addr;
                    return addr;
                });
            }
        } else {
            addrPromise = target.getAddress().then((addr) => {
                if (addr == null) { throw new Error("TODO"); }
                getInternal(this).addr = addr;
                return addr;
            });
        }

        // Set our private values
        setInternal(this, { addrPromise, addr, deployTx, subs });

        // Add the event filters
        const filters = new Proxy({ }, {
            get: (target, _prop, receiver) => {
                // Pass important checks (like `then` for Promise) through
                if (passProperties.indexOf(<string>_prop) >= 0) {
                    return Reflect.get(target, _prop, receiver);
                }

                const prop = String(_prop);

                const result = this.getEvent(prop);
                if (result) { return result; }

                throw new Error(`unknown contract event: ${ prop }`);
            }
        });
        defineProperties<BaseContract>(this, { filters });

        defineProperties<BaseContract>(this, {
            fallback: ((iface.receive || iface.fallback) ? (new WrappedFallback(this)): null)
        });

        // Return a Proxy that will respond to functions
        return new Proxy(this, {
            get: (target, _prop, receiver) => {
                if (_prop in target || passProperties.indexOf(<string>_prop) >= 0) {
                    return Reflect.get(target, _prop, receiver);
                }

                const prop = String(_prop);

                const result = target.getFunction(prop);
                if (result) { return result; }

                throw new Error(`unknown contract method: ${ prop }`);
            }
        });

    }

    connect(runner: null | ContractRunner): BaseContract {
        return new BaseContract(this.target, this.interface, runner);
    }

    async getAddress(): Promise<string> { return await getInternal(this).addrPromise; }

    async getDeployedCode(): Promise<null | string> {
        const provider = getProvider(this.runner);
        assert(provider, "runner does not support .provider",
            "UNSUPPORTED_OPERATION", { operation: "getDeployedCode" });

        const code = await provider.getCode(await this.getAddress());
        if (code === "0x") { return null; }
        return code;
    }

    async waitForDeployment(): Promise<this> {
        // We have the deployement transaction; just use that (throws if deployement fails)
        const deployTx = this.deploymentTransaction();
        if (deployTx) {
            await deployTx.wait();
            return this;
        }

        // Check for code
        const code = await this.getDeployedCode();
        if (code != null) { return this; }

        // Make sure we can subscribe to a provider event
        const provider = getProvider(this.runner);
        assert(provider != null, "contract runner does not support .provider",
            "UNSUPPORTED_OPERATION", { operation: "waitForDeployment" });

        return new Promise((resolve, reject) => {
            const checkCode = async () => {
                try {
                    const code = await this.getDeployedCode();
                    if (code != null) { return resolve(this); }
                    provider.once("block", checkCode);
                } catch (error) {
                    reject(error);
                }
            };
            checkCode();
        });
    }

    deploymentTransaction(): null | ContractTransactionResponse {
        return getInternal(this).deployTx;
    }

    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T {
        if (typeof(key) !== "string") { key = key.format(); }
        return <T><unknown>(new WrappedMethod(this, key));
    }

    getEvent(key: string | EventFragment): ContractEvent {
        if (typeof(key) !== "string") { key = key.format(); }
        return <ContractEvent><unknown>(new WrappedEvent(this, key));
    }

    async queryTransaction(hash: string): Promise<Array<EventLog>> {
        // Is this useful?
        throw new Error("@TODO");
    }

    async queryFilter(event: ContractEventName, fromBlock?: BlockTag, toBlock?: BlockTag): Promise<Array<EventLog | Log>> {
        if (fromBlock == null) { fromBlock = 0; }
        if (toBlock == null) { toBlock = "latest"; }
        const { addr, addrPromise } = getInternal(this);
        const address = (addr ? addr: (await addrPromise));
        const { fragment, topics } = await getSubInfo(this, event);
        const filter = { address, topics, fromBlock, toBlock };

        const provider = getProvider(this.runner);
        assert(provider, "contract runner does not have a provider",
            "UNSUPPORTED_OPERATION", { operation: "queryFilter" });

        return (await provider.getLogs(filter)).map((log) => {
            let foundFragment = fragment;
            if (foundFragment == null) {
                try {
                    foundFragment = this.interface.getEvent(log.topics[0]);
                } catch (error) { }
            }

            if (foundFragment) {
                return new EventLog(log, this.interface, foundFragment);
            } else {
                return new Log(log, provider);
            }
        });
    }

    async on(event: ContractEventName, listener: Listener): Promise<this> {
        const sub = await getSub(this, "on", event);
        sub.listeners.push({ listener, once: false });
        sub.start();
        return this;
    }

    async once(event: ContractEventName, listener: Listener): Promise<this> {
        const sub = await getSub(this, "once", event);
        sub.listeners.push({ listener, once: true });
        sub.start();
        return this;
    }

    async emit(event: ContractEventName, ...args: Array<any>): Promise<boolean> {
        return await emit(this, event, args, null);
    }

    async listenerCount(event?: ContractEventName): Promise<number> {
        if (event) {
            const sub = await hasSub(this, event);
            if (!sub) { return 0; }
            return sub.listeners.length;
        }

        const { subs } = getInternal(this);

        let total = 0;
        for (const { listeners } of subs.values()) {
            total += listeners.length;
        }
        return total;
    }

    async listeners(event?: ContractEventName): Promise<Array<Listener>> {
        if (event) {
            const sub = await hasSub(this, event);
            if (!sub) { return [ ]; }
            return sub.listeners.map(({ listener }) => listener);
        }

        const { subs } = getInternal(this);

        let result: Array<Listener> = [ ];
        for (const { listeners } of subs.values()) {
            result = result.concat(listeners.map(({ listener }) => listener));
        }
        return result;
    }

    async off(event: ContractEventName, listener?: Listener): Promise<this> {
        const sub = await hasSub(this, event);
        if (!sub) { return this; }

        if (listener) {
            const index = sub.listeners.map(({ listener }) => listener).indexOf(listener);
            if (index >= 0) { sub.listeners.splice(index, 1); }
        }

        if (listener == null || sub.listeners.length === 0) {
            sub.stop();
            getInternal(this).subs.delete(sub.tag);
        }

        return this;
    }

    async removeAllListeners(event?: ContractEventName): Promise<this> {
        if (event) {
            const sub = await hasSub(this, event);
            if (!sub) { return this; }
            sub.stop();
            getInternal(this).subs.delete(sub.tag);
        } else {
            const { subs } = getInternal(this);
            for (const { tag, stop } of subs.values()) {
                stop();
                subs.delete(tag);
            }
        }

        return this;
    }

    // Alias for "on"
    async addListener(event: ContractEventName, listener: Listener): Promise<this> {
        return await this.on(event, listener);
    }

    // Alias for "off"
    async removeListener(event: ContractEventName, listener: Listener): Promise<this> {
        return await this.off(event, listener);
    }

    static buildClass<T = ContractInterface>(abi: InterfaceAbi): new (target: string, runner?: null | ContractRunner) => BaseContract & Omit<T, keyof BaseContract> {
        class CustomContract extends BaseContract {
            constructor(address: string, runner: null | ContractRunner = null) {
                super(address, abi, runner);
            }
        }
        return CustomContract as any;
    };

    static from<T = ContractInterface>(target: string, abi: InterfaceAbi, runner?: null | ContractRunner): BaseContract & Omit<T, keyof BaseContract> {
        if (runner == null) { runner = null; }
        const contract = new this(target, abi, runner );
        return contract as any;
    }
}

function _ContractBase(): new (target: string, abi: InterfaceAbi, runner?: null | ContractRunner) => BaseContract & Omit<ContractInterface, keyof BaseContract> {
    return BaseContract as any;
}

export class Contract extends _ContractBase() { }
