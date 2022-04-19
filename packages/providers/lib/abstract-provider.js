// @TODO
// Event coalescence
//   When we register an event with an async value (e.g. address is a Signer
//   or ENS name), we need to add it immeidately for the Event API, but also
//   need time to resolve the address. Upon resolving the address, we need to
//   migrate the listener to the static event. We also need to maintain a map
//   of Signer/ENS name to address so we can sync respond to listenerCount.
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
var _AbstractProvider_instances, _AbstractProvider_subs, _AbstractProvider_plugins, _AbstractProvider_pausedState, _AbstractProvider_networkPromise, _AbstractProvider_anyNetwork, _AbstractProvider_performCache, _AbstractProvider_nextTimer, _AbstractProvider_timers, _AbstractProvider_disableCcipRead, _AbstractProvider_perform, _AbstractProvider_call, _AbstractProvider_getBlock, _AbstractProvider_hasSub, _AbstractProvider_getSub;
import { resolveAddress } from "@ethersproject/address";
import { concat, dataLength, dataSlice, hexlify, isHexString } from "@ethersproject/bytes";
import { isCallException } from "@ethersproject/logger";
import { toArray } from "@ethersproject/math";
import { defineProperties, EventPayload, resolveProperties } from "@ethersproject/properties";
import { toUtf8String } from "@ethersproject/strings";
import { fetchData, FetchRequest } from "@ethersproject/web";
import { EnsResolver } from "./ens-resolver.js";
import { logger } from "./logger.js";
import { Network } from "./network.js";
import { FeeData } from "./provider.js";
import { PollingBlockSubscriber, PollingEventSubscriber, PollingOrphanSubscriber, PollingTransactionSubscriber } from "./subscriber-polling.js";
// Constants
const BN_2 = BigInt(2);
const MAX_CCIP_REDIRECTS = 10;
function getTag(prefix, value) {
    return prefix + ":" + JSON.stringify(value, (k, v) => {
        if (typeof (v) === "bigint") {
            return `bigint:${v.toString()}`;
        }
        if (typeof (v) === "string") {
            return v.toLowerCase();
        }
        // Sort object keys
        if (typeof (v) === "object" && !Array.isArray(v)) {
            const keys = Object.keys(v);
            keys.sort();
            return keys.reduce((accum, key) => {
                accum[key] = v[key];
                return accum;
            }, {});
        }
        return v;
    });
}
export class UnmanagedSubscriber {
    constructor(name) { defineProperties(this, { name }); }
    start() { }
    stop() { }
    pause(dropWhilePaused) { }
    resume() { }
}
function copy(value) {
    return JSON.parse(JSON.stringify(value));
}
function concisify(items) {
    items = Array.from((new Set(items)).values());
    items.sort();
    return items;
}
// Normalize a ProviderEvent into a Subscription
// @TODO: Make events sync if possible; like block
//function getSyncSubscription(_event: ProviderEvent): Subscription {
//}
async function getSubscription(_event, provider) {
    if (_event == null) {
        throw new Error("invalid event");
    }
    // Normalize topic array info an EventFilter
    if (Array.isArray(_event)) {
        _event = { topics: _event };
    }
    if (typeof (_event) === "string") {
        switch (_event) {
            case "block":
            case "pending":
            case "debug":
            case "network": {
                return { type: _event, tag: _event };
            }
        }
    }
    if (isHexString(_event, 32)) {
        const hash = _event.toLowerCase();
        return { type: "transaction", tag: getTag("tx", { hash }), hash };
    }
    if (_event.orphan) {
        const event = _event;
        // @TODO: Should lowercase and whatnot things here instead of copy...
        return { type: "orphan", tag: getTag("orphan", event), filter: copy(event) };
    }
    if ((_event.address || _event.topics)) {
        const event = _event;
        const filter = {
            topics: ((event.topics || []).map((t) => {
                if (t == null) {
                    return null;
                }
                if (Array.isArray(t)) {
                    return concisify(t.map((t) => t.toLowerCase()));
                }
                return t.toLowerCase();
            }))
        };
        if (event.address) {
            const addresses = [];
            const promises = [];
            const addAddress = (addr) => {
                if (isHexString(addr)) {
                    addresses.push(addr);
                }
                else {
                    promises.push((async () => {
                        addresses.push(await resolveAddress(addr, provider));
                    })());
                }
            };
            if (Array.isArray(event.address)) {
                event.address.forEach(addAddress);
            }
            else {
                addAddress(event.address);
            }
            if (promises.length) {
                await Promise.all(promises);
            }
            filter.address = concisify(addresses.map((a) => a.toLowerCase()));
        }
        return { filter, tag: getTag("event", filter), type: "event" };
    }
    return logger.throwArgumentError("unknown ProviderEvent", "event", _event);
}
function getTime() { return (new Date()).getTime(); }
export function copyRequest(tx) {
    // @TODO: copy the copy from contracts and use it from this
    return tx;
}
export class AbstractProvider {
    // @TODO: This should be a () => Promise<Network> so network can be
    // done when needed; or rely entirely on _detectNetwork?
    constructor(_network) {
        _AbstractProvider_instances.add(this);
        _AbstractProvider_subs.set(this, void 0);
        _AbstractProvider_plugins.set(this, void 0);
        // null=unpaused, true=paused+dropWhilePaused, false=paused
        _AbstractProvider_pausedState.set(this, void 0);
        _AbstractProvider_networkPromise.set(this, void 0);
        _AbstractProvider_anyNetwork.set(this, void 0);
        _AbstractProvider_performCache.set(this, void 0);
        _AbstractProvider_nextTimer.set(this, void 0);
        _AbstractProvider_timers.set(this, void 0);
        _AbstractProvider_disableCcipRead.set(this, void 0);
        if (_network === "any") {
            __classPrivateFieldSet(this, _AbstractProvider_anyNetwork, true, "f");
            __classPrivateFieldSet(this, _AbstractProvider_networkPromise, null, "f");
        }
        else if (_network) {
            const network = Network.from(_network);
            __classPrivateFieldSet(this, _AbstractProvider_anyNetwork, false, "f");
            __classPrivateFieldSet(this, _AbstractProvider_networkPromise, Promise.resolve(network), "f");
            setTimeout(() => { this.emit("network", network, null); }, 0);
        }
        else {
            __classPrivateFieldSet(this, _AbstractProvider_anyNetwork, false, "f");
            __classPrivateFieldSet(this, _AbstractProvider_networkPromise, null, "f");
        }
        //this.#approxNumber = -2;
        //this.#approxNumberT0 = 0;
        __classPrivateFieldSet(this, _AbstractProvider_performCache, new Map(), "f");
        __classPrivateFieldSet(this, _AbstractProvider_subs, new Map(), "f");
        __classPrivateFieldSet(this, _AbstractProvider_plugins, new Map(), "f");
        __classPrivateFieldSet(this, _AbstractProvider_pausedState, null, "f");
        __classPrivateFieldSet(this, _AbstractProvider_nextTimer, 0, "f");
        __classPrivateFieldSet(this, _AbstractProvider_timers, new Map(), "f");
        __classPrivateFieldSet(this, _AbstractProvider_disableCcipRead, false, "f");
    }
    get provider() { return this; }
    get plugins() {
        return Array.from(__classPrivateFieldGet(this, _AbstractProvider_plugins, "f").values());
    }
    attachPlugin(plugin) {
        if (__classPrivateFieldGet(this, _AbstractProvider_plugins, "f").get(plugin.name)) {
            throw new Error(`cannot replace existing plugin: ${plugin.name} `);
        }
        __classPrivateFieldGet(this, _AbstractProvider_plugins, "f").set(plugin.name, plugin.validate(this));
        return this;
    }
    getPlugin(name) {
        return (__classPrivateFieldGet(this, _AbstractProvider_plugins, "f").get(name)) || null;
    }
    set disableCcipRead(value) { __classPrivateFieldSet(this, _AbstractProvider_disableCcipRead, !!value, "f"); }
    get disableCcipRead() { return __classPrivateFieldGet(this, _AbstractProvider_disableCcipRead, "f"); }
    async ccipReadFetch(tx, calldata, urls) {
        if (this.disableCcipRead || urls.length === 0 || tx.to == null) {
            return null;
        }
        const sender = tx.to.toLowerCase();
        const data = calldata.toLowerCase();
        const errorMessages = [];
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            // URL expansion
            const href = url.replace("{sender}", sender).replace("{data}", data);
            // If no {data} is present, use POST; otherwise GET
            //const json: string | null = (url.indexOf("{data}") >= 0) ? null: JSON.stringify({ data, sender });
            //const result = await fetchJson({ url: href, errorPassThrough: true }, json, (value, response) => {
            //    value.status = response.statusCode;
            //    return value;
            //});
            const request = new FetchRequest(href);
            if (url.indexOf("{data}") === -1) {
                request.body = { data, sender };
            }
            let errorMessage = "unknown error";
            const resp = await fetchData(request);
            try {
                const result = resp.bodyJson;
                if (result.data) {
                    return result.data;
                }
                if (result.message) {
                    errorMessage = result.message;
                }
            }
            catch (error) { }
            // 4xx indicates the result is not present; stop
            if (resp.statusCode >= 400 && resp.statusCode < 500) {
                return logger.throwError(`response not found during CCIP fetch: ${errorMessage}`, "OFFCHAIN_FAULT", {
                    reason: "404_MISSING_RESOURCE",
                    transaction: tx, info: { url, errorMessage }
                });
            }
            // 5xx indicates server issue; try the next url
            errorMessages.push(errorMessage);
        }
        return logger.throwError(`error encountered during CCIP fetch: ${errorMessages.map((m) => JSON.stringify(m)).join(", ")}`, "OFFCHAIN_FAULT", {
            reason: "500_SERVER_ERROR",
            transaction: tx, info: { urls, errorMessages }
        });
    }
    _wrapTransaction(tx, hash, blockNumber) {
        return tx;
    }
    _detectNetwork() {
        return logger.throwError("sub-classes must implement this", "UNSUPPORTED_OPERATION", {
            operation: "_detectNetwork"
        });
    }
    async _perform(req) {
        return logger.throwError(`unsupported method: ${req.method}`, "UNSUPPORTED_OPERATION", {
            operation: req.method,
            info: req
        });
    }
    // State
    async getBlockNumber() {
        return logger.getNumber(await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_perform).call(this, { method: "getBlockNumber" }), "%response");
    }
    async _getAddress(address) {
        if (typeof (address) === "string") {
            return address;
        }
        return await address.getAddress();
    }
    async _getBlockTag(blockTag) {
        const network = await this.getNetwork();
        if (typeof (blockTag) === "number" && Number.isSafeInteger(blockTag) && blockTag < 0) {
            //let blockNumber = await this._getApproxBlockNumber(500);
            let blockNumber = await this.getBlockNumber();
            blockNumber += blockTag;
            if (blockNumber < 0) {
                blockNumber = 0;
            }
            return network.formatter.blockTag(blockNumber);
        }
        return network.formatter.blockTag(blockTag);
    }
    async getNetwork() {
        // No explicit network was set and this is our first time
        if (__classPrivateFieldGet(this, _AbstractProvider_networkPromise, "f") == null) {
            // Detect the current network (shared with all calls)
            const detectNetwork = this._detectNetwork().then((network) => {
                this.emit("network", network, null);
                return network;
            }, (error) => {
                // Reset the networkPromise on failure, so we will try again
                if (__classPrivateFieldGet(this, _AbstractProvider_networkPromise, "f") === detectNetwork) {
                    __classPrivateFieldSet(this, _AbstractProvider_networkPromise, null, "f");
                }
                throw error;
            });
            __classPrivateFieldSet(this, _AbstractProvider_networkPromise, detectNetwork, "f");
            return await detectNetwork;
        }
        const networkPromise = __classPrivateFieldGet(this, _AbstractProvider_networkPromise, "f");
        const [expected, actual] = await Promise.all([
            networkPromise,
            this._detectNetwork() // The actual connected network
        ]);
        if (expected.chainId !== actual.chainId) {
            if (__classPrivateFieldGet(this, _AbstractProvider_anyNetwork, "f")) {
                // The "any" network can change, so notify listeners
                this.emit("network", actual, expected);
                // Update the network if something else hasn't already changed it
                if (__classPrivateFieldGet(this, _AbstractProvider_networkPromise, "f") === networkPromise) {
                    __classPrivateFieldSet(this, _AbstractProvider_networkPromise, Promise.resolve(actual), "f");
                }
            }
            else {
                // Otherwise, we do not allow changes to the underlying network
                logger.throwError(`network changed: ${expected.chainId} => ${actual.chainId} `, "NETWORK_ERROR", {
                    event: "changed"
                });
            }
        }
        return expected.clone().freeze();
    }
    async getFeeData() {
        const { block, gasPrice } = await resolveProperties({
            block: this.getBlock("latest"),
            gasPrice: ((async () => {
                try {
                    const gasPrice = await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_perform).call(this, { method: "getGasPrice" });
                    return logger.getBigInt(gasPrice, "%response");
                }
                catch (error) { }
                return null;
            })())
        });
        let maxFeePerGas = null, maxPriorityFeePerGas = null;
        if (block && block.baseFeePerGas) {
            // We may want to compute this more accurately in the future,
            // using the formula "check if the base fee is correct".
            // See: https://eips.ethereum.org/EIPS/eip-1559
            maxPriorityFeePerGas = BigInt("1500000000");
            // Allow a network to override their maximum priority fee per gas
            const priorityFeePlugin = (await this.getNetwork()).getPlugin("org.ethers.plugins.max-priority-fee");
            if (priorityFeePlugin) {
                maxPriorityFeePerGas = await priorityFeePlugin.getPriorityFee(this);
            }
            maxFeePerGas = (block.baseFeePerGas * BN_2) + maxPriorityFeePerGas;
        }
        return new FeeData(gasPrice, maxFeePerGas, maxPriorityFeePerGas);
    }
    async _getTransaction(_request) {
        const network = await this.getNetwork();
        // Fill in any addresses
        const request = Object.assign({}, _request, await resolveProperties({
            to: (_request.to ? resolveAddress(_request.to, this) : undefined),
            from: (_request.from ? resolveAddress(_request.from, this) : undefined),
        }));
        return network.formatter.transactionRequest(request);
    }
    async estimateGas(_tx) {
        const transaction = await this._getTransaction(_tx);
        return logger.getBigInt(await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_perform).call(this, {
            method: "estimateGas", transaction
        }), "%response");
    }
    async call(_tx) {
        const { tx, blockTag } = await resolveProperties({
            tx: this._getTransaction(_tx),
            blockTag: this._getBlockTag(_tx.blockTag)
        });
        return __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_call).call(this, tx, blockTag, _tx.enableCcipRead ? 0 : -1);
    }
    // Account
    async getBalanceOf(_address, _blockTag) {
        const { address, blockTag } = await resolveProperties({
            address: resolveAddress(_address),
            blockTag: this._getBlockTag(_blockTag)
        });
        return logger.getBigInt(await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_perform).call(this, {
            method: "getBalance", address, blockTag
        }), "%response");
    }
    async getTransactionCountOf(_address, _blockTag) {
        const { address, blockTag } = await resolveProperties({
            address: resolveAddress(_address),
            blockTag: this._getBlockTag(_blockTag)
        });
        return logger.getNumber(await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_perform).call(this, {
            method: "getTransactionCount", address, blockTag
        }), "%response");
    }
    async getCode(_address, _blockTag) {
        const { address, blockTag } = await resolveProperties({
            address: resolveAddress(_address),
            blockTag: this._getBlockTag(_blockTag)
        });
        return hexlify(await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_perform).call(this, {
            method: "getCode", address, blockTag
        }));
    }
    async getStorageAt(_address, _position, _blockTag) {
        const position = logger.getBigInt(_position);
        const { address, blockTag } = await resolveProperties({
            address: resolveAddress(_address),
            blockTag: this._getBlockTag(_blockTag)
        });
        return hexlify(await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_perform).call(this, {
            method: "getStorageAt", address, position, blockTag
        }));
    }
    // Write
    async broadcastTransaction(signedTx) {
        throw new Error();
        return {};
    }
    // Queries
    async getBlock(block) {
        const format = (await this.getNetwork()).formatter;
        const params = await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_getBlock).call(this, block, false);
        if (params == null) {
            return null;
        }
        return format.block(params, this);
    }
    async getBlockWithTransactions(block) {
        const format = (await this.getNetwork()).formatter;
        const params = __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_getBlock).call(this, block, true);
        if (params == null) {
            return null;
        }
        return format.blockWithTransactions(params, this);
    }
    async getTransaction(hash) {
        const format = (await this.getNetwork()).formatter;
        const params = await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_perform).call(this, { method: "getTransaction", hash });
        return format.transactionResponse(params, this);
    }
    async getTransactionReceipt(hash) {
        const format = (await this.getNetwork()).formatter;
        const receipt = await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_perform).call(this, { method: "getTransactionReceipt", hash });
        if (receipt == null) {
            return null;
        }
        // Some backends did not backfill the effectiveGasPrice into old transactions
        // in the receipt, so we look it up manually and inject it.
        if (receipt.gasPrice == null && receipt.effectiveGasPrice == null) {
            const tx = await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_perform).call(this, { method: "getTransaction", hash });
            receipt.effectiveGasPrice = tx.gasPrice;
        }
        return format.receipt(receipt, this);
    }
    async _getFilter(filter) {
        // Create a canonical representation of the topics
        const topics = (filter.topics || []).map((t) => {
            if (t == null) {
                return null;
            }
            if (Array.isArray(t)) {
                return concisify(t.map((t) => t.toLowerCase()));
            }
            return t.toLowerCase();
        });
        const blockHash = ("blockHash" in filter) ? filter.blockHash : undefined;
        const lookup = {};
        // Addresses could be async (ENS names or Addressables)
        if (filter.address) {
            if (Array.isArray(filter.address)) {
                lookup.address = Promise.all(filter.address.map((a) => resolveAddress(a, this)));
            }
            else {
                lookup.address = resolveAddress(filter.address, this);
            }
        }
        // Block Tags could be async (i.e. relative)
        const addBlockTag = (key) => {
            if (filter[key] == null) {
                return;
            }
            lookup[key] = this._getBlockTag(filter[key]);
        };
        addBlockTag("fromBlock");
        addBlockTag("toBlock");
        // Wait for all properties to resolve
        const result = await resolveProperties(lookup);
        // Make sure things are canonical
        if (Array.isArray(result.address)) {
            result.address.sort();
        }
        result.topics = topics;
        if (blockHash) {
            if (filter.fromBlock || filter.toBlock) {
                throw new Error("invalid filter");
            }
            result.blockHash = blockHash;
        }
        return result;
    }
    // Bloom-filter Queries
    async getLogs(_filter) {
        const { network, filter } = await resolveProperties({
            network: this.getNetwork(),
            filter: this._getFilter(_filter)
        });
        return (await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_perform).call(this, { method: "getLogs", filter })).map((l) => {
            return network.formatter.log(l, this);
        });
    }
    // ENS
    _getProvider(chainId) {
        return logger.throwError("provider cannot connect to target network", "UNSUPPORTED_OPERATION", {
            operation: "_getProvider()"
        });
    }
    async getResolver(name) {
        return await EnsResolver.fromName(this, name);
    }
    async getAvatar(name) {
        const resolver = await this.getResolver(name);
        if (resolver) {
            return await resolver.getAvatar();
        }
        return null;
    }
    async resolveName(name) {
        if (typeof (name) === "string") {
            const resolver = await this.getResolver(name);
            if (resolver) {
                return await resolver.getAddress();
            }
        }
        else {
            const address = await name.getAddress();
            if (address == null) {
                return logger.throwArgumentError("Addressable returned no address", "name", name);
            }
            return address;
        }
        return null;
    }
    async lookupAddress(address) {
        throw new Error();
        //return "TODO";
    }
    async waitForTransaction(hash, confirms = 1, timeout) {
        if (confirms === 0) {
            return this.getTransactionReceipt(hash);
        }
        return new Promise(async (resolve, reject) => {
            let timer = null;
            const listener = (async (blockNumber) => {
                try {
                    const receipt = await this.getTransactionReceipt(hash);
                    if (receipt != null) {
                        if (blockNumber - receipt.blockNumber + 1 >= confirms) {
                            resolve(receipt);
                            this.off("block", listener);
                            if (timer) {
                                clearTimeout(timer);
                                timer = null;
                            }
                            return;
                        }
                    }
                }
                catch (error) {
                    console.log("EEE", error);
                }
                this.once("block", listener);
            });
            if (timeout != null) {
                timer = setTimeout(() => {
                    if (timer == null) {
                        return;
                    }
                    timer = null;
                    this.off("block", listener);
                    reject(logger.makeError("timeout", "TIMEOUT", {}));
                }, timeout);
            }
            listener(await this.getBlockNumber());
        });
    }
    async waitForBlock(blockTag) {
        throw new Error();
        //return new Block(<any><unknown>{ }, this);
    }
    _clearTimeout(timerId) {
        const timer = __classPrivateFieldGet(this, _AbstractProvider_timers, "f").get(timerId);
        if (!timer) {
            return;
        }
        if (timer.timer) {
            clearTimeout(timer.timer);
        }
        __classPrivateFieldGet(this, _AbstractProvider_timers, "f").delete(timerId);
    }
    _setTimeout(_func, timeout = 0) {
        var _a, _b;
        const timerId = (__classPrivateFieldSet(this, _AbstractProvider_nextTimer, (_b = __classPrivateFieldGet(this, _AbstractProvider_nextTimer, "f"), _a = _b++, _b), "f"), _a);
        const func = () => {
            __classPrivateFieldGet(this, _AbstractProvider_timers, "f").delete(timerId);
            _func();
        };
        if (this.paused) {
            __classPrivateFieldGet(this, _AbstractProvider_timers, "f").set(timerId, { timer: null, func, time: timeout });
        }
        else {
            const timer = setTimeout(func, timeout);
            __classPrivateFieldGet(this, _AbstractProvider_timers, "f").set(timerId, { timer, func, time: getTime() });
        }
        return timerId;
    }
    _forEachSubscriber(func) {
        for (const sub of __classPrivateFieldGet(this, _AbstractProvider_subs, "f").values()) {
            func(sub.subscriber);
        }
    }
    // Event API; sub-classes should override this; any supported
    // event filter will have been munged into an EventFilter
    _getSubscriber(sub) {
        switch (sub.type) {
            case "debug":
            case "network":
                return new UnmanagedSubscriber(sub.type);
            case "block":
                return new PollingBlockSubscriber(this);
            case "event":
                return new PollingEventSubscriber(this, sub.filter);
            case "transaction":
                return new PollingTransactionSubscriber(this, sub.hash);
            case "orphan":
                return new PollingOrphanSubscriber(this, sub.filter);
        }
        throw new Error(`unsupported event: ${sub.type}`);
    }
    _recoverSubscriber(oldSub, newSub) {
        for (const sub of __classPrivateFieldGet(this, _AbstractProvider_subs, "f").values()) {
            if (sub.subscriber === oldSub) {
                if (sub.started) {
                    sub.subscriber.stop();
                }
                sub.subscriber = newSub;
                if (sub.started) {
                    newSub.start();
                }
                if (__classPrivateFieldGet(this, _AbstractProvider_pausedState, "f") != null) {
                    newSub.pause(__classPrivateFieldGet(this, _AbstractProvider_pausedState, "f"));
                }
                break;
            }
        }
    }
    async on(event, listener) {
        const sub = await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_getSub).call(this, event);
        sub.listeners.push({ listener, once: false });
        if (!sub.started) {
            sub.subscriber.start();
            sub.started = true;
            if (__classPrivateFieldGet(this, _AbstractProvider_pausedState, "f") != null) {
                sub.subscriber.pause(__classPrivateFieldGet(this, _AbstractProvider_pausedState, "f"));
            }
        }
        return this;
    }
    async once(event, listener) {
        const sub = await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_getSub).call(this, event);
        sub.listeners.push({ listener, once: true });
        if (!sub.started) {
            sub.subscriber.start();
            sub.started = true;
            if (__classPrivateFieldGet(this, _AbstractProvider_pausedState, "f") != null) {
                sub.subscriber.pause(__classPrivateFieldGet(this, _AbstractProvider_pausedState, "f"));
            }
        }
        return this;
    }
    async emit(event, ...args) {
        const sub = await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_hasSub).call(this, event, args);
        if (!sub) {
            return false;
        }
        ;
        const count = sub.listeners.length;
        sub.listeners = sub.listeners.filter(({ listener, once }) => {
            const payload = new EventPayload(this, (once ? null : listener), event);
            try {
                listener.call(this, ...args, payload);
            }
            catch (error) { }
            return !once;
        });
        return (count > 0);
    }
    async listenerCount(event) {
        if (event) {
            const sub = await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_hasSub).call(this, event);
            if (!sub) {
                return 0;
            }
            return sub.listeners.length;
        }
        let total = 0;
        for (const { listeners } of __classPrivateFieldGet(this, _AbstractProvider_subs, "f").values()) {
            total += listeners.length;
        }
        return total;
    }
    async listeners(event) {
        if (event) {
            const sub = await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_hasSub).call(this, event);
            if (!sub) {
                return [];
            }
            return sub.listeners.map(({ listener }) => listener);
        }
        let result = [];
        for (const { listeners } of __classPrivateFieldGet(this, _AbstractProvider_subs, "f").values()) {
            result = result.concat(listeners.map(({ listener }) => listener));
        }
        return result;
    }
    async off(event, listener) {
        const sub = await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_hasSub).call(this, event);
        if (!sub) {
            return this;
        }
        if (listener) {
            const index = sub.listeners.map(({ listener }) => listener).indexOf(listener);
            if (index >= 0) {
                sub.listeners.splice(index, 1);
            }
        }
        if (!listener || sub.listeners.length === 0) {
            if (sub.started) {
                sub.subscriber.stop();
            }
            __classPrivateFieldGet(this, _AbstractProvider_subs, "f").delete(sub.tag);
        }
        return this;
    }
    async removeAllListeners(event) {
        if (event) {
            const { tag, started, subscriber } = await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_getSub).call(this, event);
            if (started) {
                subscriber.stop();
            }
            __classPrivateFieldGet(this, _AbstractProvider_subs, "f").delete(tag);
        }
        else {
            for (const [tag, { started, subscriber }] of __classPrivateFieldGet(this, _AbstractProvider_subs, "f")) {
                if (started) {
                    subscriber.stop();
                }
                __classPrivateFieldGet(this, _AbstractProvider_subs, "f").delete(tag);
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
        return this.off(event, listener);
    }
    // Sub-classes should override this to shutdown any sockets, etc.
    // but MUST call this super.shutdown.
    async shutdown() {
        // Stop all listeners
        this.removeAllListeners();
        // Shut down all tiemrs
        for (const timerId of __classPrivateFieldGet(this, _AbstractProvider_timers, "f").keys()) {
            this._clearTimeout(timerId);
        }
    }
    get paused() { return (__classPrivateFieldGet(this, _AbstractProvider_pausedState, "f") != null); }
    pause(dropWhilePaused) {
        if (__classPrivateFieldGet(this, _AbstractProvider_pausedState, "f") != null) {
            if (__classPrivateFieldGet(this, _AbstractProvider_pausedState, "f") == !!dropWhilePaused) {
                return;
            }
            return logger.throwError("cannot change pause type; resume first", "UNSUPPORTED_OPERATION", {
                operation: "pause"
            });
        }
        this._forEachSubscriber((s) => s.pause(dropWhilePaused));
        __classPrivateFieldSet(this, _AbstractProvider_pausedState, !!dropWhilePaused, "f");
        for (const timer of __classPrivateFieldGet(this, _AbstractProvider_timers, "f").values()) {
            // Clear the timer
            if (timer.timer) {
                clearTimeout(timer.timer);
            }
            // Remaining time needed for when we become unpaused
            timer.time = getTime() - timer.time;
        }
    }
    resume() {
        if (__classPrivateFieldGet(this, _AbstractProvider_pausedState, "f") == null) {
            return;
        }
        this._forEachSubscriber((s) => s.resume());
        __classPrivateFieldSet(this, _AbstractProvider_pausedState, null, "f");
        for (const timer of __classPrivateFieldGet(this, _AbstractProvider_timers, "f").values()) {
            // Remaining time when we were paused
            let timeout = timer.time;
            if (timeout < 0) {
                timeout = 0;
            }
            // Start time (in cause paused, so we con compute remaininf time)
            timer.time = getTime();
            // Start the timer
            setTimeout(timer.func, timeout);
        }
    }
}
_AbstractProvider_subs = new WeakMap(), _AbstractProvider_plugins = new WeakMap(), _AbstractProvider_pausedState = new WeakMap(), _AbstractProvider_networkPromise = new WeakMap(), _AbstractProvider_anyNetwork = new WeakMap(), _AbstractProvider_performCache = new WeakMap(), _AbstractProvider_nextTimer = new WeakMap(), _AbstractProvider_timers = new WeakMap(), _AbstractProvider_disableCcipRead = new WeakMap(), _AbstractProvider_instances = new WeakSet(), _AbstractProvider_perform = 
// Shares multiple identical requests made during the same 250ms
async function _AbstractProvider_perform(req) {
    // Create a tag
    const tag = getTag(req.method, req);
    let perform = __classPrivateFieldGet(this, _AbstractProvider_performCache, "f").get(tag);
    if (!perform) {
        perform = this._perform(req);
        __classPrivateFieldGet(this, _AbstractProvider_performCache, "f").set(tag, perform);
        setTimeout(() => {
            if (__classPrivateFieldGet(this, _AbstractProvider_performCache, "f").get(tag) === perform) {
                __classPrivateFieldGet(this, _AbstractProvider_performCache, "f").delete(tag);
            }
        }, 250);
    }
    return await perform;
}, _AbstractProvider_call = async function _AbstractProvider_call(tx, blockTag, attempt) {
    if (attempt >= MAX_CCIP_REDIRECTS) {
        logger.throwError("CCIP read exceeded maximum redirections", "OFFCHAIN_FAULT", {
            reason: "TOO_MANY_REDIRECTS",
            transaction: Object.assign({}, tx, { blockTag, enableCcipRead: true })
        });
    }
    const transaction = copyRequest(tx);
    try {
        return hexlify(await this._perform({ method: "call", transaction, blockTag }));
    }
    catch (error) {
        // CCIP Read OffchainLookup
        if (!this.disableCcipRead && isCallException(error) && attempt >= 0 && blockTag === "latest" && transaction.to != null && dataSlice(error.data, 0, 4) === "0x556f1830") {
            const data = error.data;
            const txSender = await resolveAddress(transaction.to, this);
            // Parse the CCIP Read Arguments
            let ccipArgs;
            try {
                ccipArgs = parseOffchainLookup(dataSlice(error.data, 4));
            }
            catch (error) {
                return logger.throwError(error.message, "OFFCHAIN_FAULT", {
                    reason: "BAD_DATA",
                    transaction, info: { data }
                });
            }
            // Check the sender of the OffchainLookup matches the transaction
            if (ccipArgs.sender.toLowerCase() !== txSender.toLowerCase()) {
                return logger.throwError("CCIP Read sender mismatch", "CALL_EXCEPTION", {
                    data, transaction,
                    errorSignature: "OffchainLookup(address,string[],bytes,bytes4,bytes)",
                    errorName: "OffchainLookup",
                    errorArgs: ccipArgs.errorArgs
                });
            }
            const ccipResult = await this.ccipReadFetch(transaction, ccipArgs.calldata, ccipArgs.urls);
            if (ccipResult == null) {
                return logger.throwError("CCIP Read failed to fetch data", "OFFCHAIN_FAULT", {
                    reason: "FETCH_FAILED",
                    transaction, info: { data: error.data, errorArgs: ccipArgs.errorArgs }
                });
            }
            return __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_call).call(this, {
                to: txSender,
                data: concat([
                    ccipArgs.selector, encodeBytes([ccipResult, ccipArgs.extraData])
                ]),
            }, blockTag, attempt + 1);
        }
        throw error;
    }
}, _AbstractProvider_getBlock = async function _AbstractProvider_getBlock(block, includeTransactions) {
    const format = (await this.getNetwork()).formatter;
    if (isHexString(block, 32)) {
        return await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_perform).call(this, {
            method: "getBlock", blockHash: block, includeTransactions
        });
    }
    return await __classPrivateFieldGet(this, _AbstractProvider_instances, "m", _AbstractProvider_perform).call(this, {
        method: "getBlock", blockTag: format.blockTag(block), includeTransactions
    });
}, _AbstractProvider_hasSub = async function _AbstractProvider_hasSub(event, emitArgs) {
    let sub = await getSubscription(event, this);
    // This is a log that is removing an existing log; we actually want
    // to emit an orphan event for the removed log
    if (sub.type === "event" && emitArgs && emitArgs.length > 0 && emitArgs[0].removed === true) {
        sub = await getSubscription({ orphan: "drop-log", log: emitArgs[0] }, this);
    }
    return __classPrivateFieldGet(this, _AbstractProvider_subs, "f").get(sub.tag) || null;
}, _AbstractProvider_getSub = async function _AbstractProvider_getSub(event) {
    const subscription = await getSubscription(event, this);
    // Prevent tampering with our tag in any subclass' _getSubscriber
    const tag = subscription.tag;
    let sub = __classPrivateFieldGet(this, _AbstractProvider_subs, "f").get(tag);
    if (!sub) {
        const subscriber = this._getSubscriber(subscription);
        const addressableMap = new WeakMap();
        const nameMap = new Map();
        sub = { subscriber, tag, addressableMap, nameMap, started: false, listeners: [] };
        __classPrivateFieldGet(this, _AbstractProvider_subs, "f").set(tag, sub);
    }
    return sub;
};
function _parseString(result, start) {
    try {
        const bytes = _parseBytes(result, start);
        if (bytes) {
            return toUtf8String(bytes);
        }
    }
    catch (error) { }
    return null;
}
function _parseBytes(result, start) {
    if (result === "0x") {
        return null;
    }
    try {
        const offset = logger.getNumber(dataSlice(result, start, start + 32));
        const length = logger.getNumber(dataSlice(result, offset, offset + 32));
        return dataSlice(result, offset + 32, offset + 32 + length);
    }
    catch (error) { }
    return null;
}
function numPad(value) {
    const result = toArray(value);
    if (result.length > 32) {
        throw new Error("internal; should not happen");
    }
    const padded = new Uint8Array(32);
    padded.set(result, 32 - result.length);
    return padded;
}
function bytesPad(value) {
    if ((value.length % 32) === 0) {
        return value;
    }
    const result = new Uint8Array(Math.ceil(value.length / 32) * 32);
    result.set(value);
    return result;
}
const empty = new Uint8Array([]);
// ABI Encodes a series of (bytes, bytes, ...)
function encodeBytes(datas) {
    const result = [];
    let byteCount = 0;
    // Add place-holders for pointers as we add items
    for (let i = 0; i < datas.length; i++) {
        result.push(empty);
        byteCount += 32;
    }
    for (let i = 0; i < datas.length; i++) {
        const data = logger.getBytes(datas[i]);
        // Update the bytes offset
        result[i] = numPad(byteCount);
        // The length and padded value of data
        result.push(numPad(data.length));
        result.push(bytesPad(data));
        byteCount += 32 + Math.ceil(data.length / 32) * 32;
    }
    return concat(result);
}
const zeros = "0x0000000000000000000000000000000000000000000000000000000000000000";
function parseOffchainLookup(data) {
    const result = {
        sender: "", urls: [], calldata: "", selector: "", extraData: "", errorArgs: []
    };
    if (dataLength(data) < 5 * 32) {
        throw new Error("insufficient OffchainLookup data");
    }
    const sender = dataSlice(data, 0, 32);
    if (dataSlice(sender, 0, 12) !== dataSlice(zeros, 0, 12)) {
        throw new Error("corrupt OffchainLookup sender");
    }
    result.sender = dataSlice(sender, 12);
    // Read the URLs from the response
    try {
        const urls = [];
        const urlsOffset = logger.getNumber(dataSlice(data, 32, 64));
        const urlsLength = logger.getNumber(dataSlice(data, urlsOffset, urlsOffset + 32));
        const urlsData = dataSlice(data, urlsOffset + 32);
        for (let u = 0; u < urlsLength; u++) {
            const url = _parseString(urlsData, u * 32);
            if (url == null) {
                throw new Error("abort");
            }
            urls.push(url);
        }
        result.urls = urls;
    }
    catch (error) {
        throw new Error("corrupt OffchainLookup urls");
    }
    // Get the CCIP calldata to forward
    try {
        const calldata = _parseBytes(data, 64);
        if (calldata == null) {
            throw new Error("abort");
        }
        result.calldata = calldata;
    }
    catch (error) {
        throw new Error("corrupt OffchainLookup calldata");
    }
    // Get the callbackSelector (bytes4)
    if (dataSlice(data, 100, 128) !== dataSlice(zeros, 0, 28)) {
        throw new Error("corrupt OffchainLookup callbaackSelector");
    }
    result.selector = dataSlice(data, 96, 100);
    // Get the extra data to send back to the contract as context
    try {
        const extraData = _parseBytes(data, 128);
        if (extraData == null) {
            throw new Error("abort");
        }
        result.extraData = extraData;
    }
    catch (error) {
        throw new Error("corrupt OffchainLookup extraData");
    }
    result.errorArgs = "sender,urls,calldata,selector,extraData".split(/,/).map((k) => result[k]);
    return result;
}
//# sourceMappingURL=abstract-provider.js.map