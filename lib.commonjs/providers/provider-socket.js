"use strict";
/**
 *  Generic long-lived socket provider.
 *
 *  Sub-classing notes
 *  - a sub-class MUST call the `_start()` method once connected
 *  - a sub-class MUST override the `_write(string)` method
 *  - a sub-class MUST call `_processMessage(string)` for each message
 *
 *  @_subsection: api/providers/abstract-provider
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketProvider = exports.SocketEventSubscriber = exports.SocketPendingFullSubscriber = exports.SocketPendingSubscriber = exports.SocketBlockSubscriber = exports.SocketSubscriber = void 0;
const abstract_provider_js_1 = require("./abstract-provider.js");
const index_js_1 = require("../utils/index.js");
const format_js_1 = require("./format.js");
const provider_jsonrpc_js_1 = require("./provider-jsonrpc.js");
const provider_js_1 = require("./provider.js");
class SocketSubscriber {
    #provider;
    #filter;
    get filter() { return JSON.parse(this.#filter); }
    #filterId;
    #paused;
    #emitPromise;
    constructor(provider, filter) {
        this.#provider = provider;
        this.#filter = JSON.stringify(filter);
        this.#filterId = null;
        this.#paused = null;
        this.#emitPromise = null;
    }
    start() {
        this.#filterId = this.#provider.send("eth_subscribe", this.filter).then((filterId) => {
            ;
            this.#provider._register(filterId, this);
            return filterId;
        });
    }
    stop() {
        (this.#filterId).then((filterId) => {
            this.#provider.send("eth_unsubscribe", [filterId]);
        });
        this.#filterId = null;
    }
    // @TODO: pause should trap the current blockNumber, unsub, and on resume use getLogs
    //        and resume
    pause(dropWhilePaused) {
        (0, index_js_1.assert)(dropWhilePaused, "preserve logs while paused not supported by SocketSubscriber yet", "UNSUPPORTED_OPERATION", { operation: "pause(false)" });
        this.#paused = !!dropWhilePaused;
    }
    resume() {
        this.#paused = null;
    }
    _handleMessage(message) {
        if (this.#filterId == null) {
            return;
        }
        if (this.#paused === null) {
            let emitPromise = this.#emitPromise;
            if (emitPromise == null) {
                emitPromise = this._emit(this.#provider, message);
            }
            else {
                emitPromise = emitPromise.then(async () => {
                    await this._emit(this.#provider, message);
                });
            }
            this.#emitPromise = emitPromise.then(() => {
                if (this.#emitPromise === emitPromise) {
                    this.#emitPromise = null;
                }
            });
        }
    }
    async _emit(provider, message) {
        throw new Error("sub-classes must implemente this; _emit");
    }
}
exports.SocketSubscriber = SocketSubscriber;
class SocketBlockSubscriber extends SocketSubscriber {
    constructor(provider) {
        super(provider, ["newHeads"]);
    }
    async _emit(provider, message) {
        provider.emit("block", parseInt(message.number));
    }
}
exports.SocketBlockSubscriber = SocketBlockSubscriber;
class SocketPendingSubscriber extends SocketSubscriber {
    constructor(provider) {
        super(provider, ["newPendingTransactions"]);
    }
    async _emit(provider, message) {
        provider.emit("pending", message);
    }
}
exports.SocketPendingSubscriber = SocketPendingSubscriber;
class SocketPendingFullSubscriber extends SocketSubscriber {
    constructor(provider) {
        super(provider, ["newPendingTransactions", true]);
    }
    async _emit(provider, message) {
        provider.emit("pending_full", new provider_js_1.TransactionResponse((0, format_js_1.formatTransactionResponse)(message), provider));
    }
}
exports.SocketPendingFullSubscriber = SocketPendingFullSubscriber;
class SocketEventSubscriber extends SocketSubscriber {
    #logFilter;
    get logFilter() { return JSON.parse(this.#logFilter); }
    constructor(provider, filter) {
        super(provider, ["logs", filter]);
        this.#logFilter = JSON.stringify(filter);
    }
    async _emit(provider, message) {
        provider.emit(this.#logFilter, provider._wrapLog(message, provider._network));
    }
}
exports.SocketEventSubscriber = SocketEventSubscriber;
/**
 *  SocketProvider...
 *
 */
class SocketProvider extends provider_jsonrpc_js_1.JsonRpcApiProvider {
    #callbacks;
    // Maps each filterId to its subscriber
    #subs;
    // If any events come in before a subscriber has finished
    // registering, queue them
    #pending;
    constructor(network) {
        super(network, { batchMaxCount: 1 });
        this.#callbacks = new Map();
        this.#subs = new Map();
        this.#pending = new Map();
    }
    // This value is only valid after _start has been called
    /*
    get _network(): Network {
        if (this.#network == null) {
            throw new Error("this shouldn't happen");
        }
        return this.#network.clone();
    }
    */
    _getSubscriber(sub) {
        switch (sub.type) {
            case "close":
                return new abstract_provider_js_1.UnmanagedSubscriber("close");
            case "block":
                return new SocketBlockSubscriber(this);
            case "pending":
                return new SocketPendingSubscriber(this);
            case "pending_full":
                return new SocketPendingFullSubscriber(this);
            case "event":
                return new SocketEventSubscriber(this, sub.filter);
            case "orphan":
                // Handled auto-matically within AbstractProvider
                // when the log.removed = true
                if (sub.filter.orphan === "drop-log") {
                    return new abstract_provider_js_1.UnmanagedSubscriber("drop-log");
                }
        }
        return super._getSubscriber(sub);
    }
    _register(filterId, subscriber) {
        this.#subs.set(filterId, subscriber);
        const pending = this.#pending.get(filterId);
        if (pending) {
            for (const message of pending) {
                subscriber._handleMessage(message);
            }
            this.#pending.delete(filterId);
        }
    }
    async _send(payload) {
        // WebSocket provider doesn't accept batches
        (0, index_js_1.assertArgument)(!Array.isArray(payload), "WebSocket does not support batch send", "payload", payload);
        // @TODO: stringify payloads here and store to prevent mutations
        // Prepare a promise to respond to
        const promise = new Promise((resolve, reject) => {
            this.#callbacks.set(payload.id, { payload, resolve, reject });
        });
        // Wait until the socket is connected before writing to it
        await this._waitUntilReady();
        // Write the request to the socket
        await this._write(JSON.stringify(payload));
        return [await promise];
    }
    // Sub-classes must call this once they are connected
    /*
    async _start(): Promise<void> {
        if (this.#ready) { return; }

        for (const { payload } of this.#callbacks.values()) {
            await this._write(JSON.stringify(payload));
        }

        this.#ready = (async function() {
            await super._start();
        })();
    }
    */
    // Sub-classes must call this for each message
    async _processMessage(message) {
        const result = (JSON.parse(message));
        if ("id" in result) {
            const callback = this.#callbacks.get(result.id);
            if (callback == null) {
                console.log("Weird... Response for not a thing we sent");
                return;
            }
            this.#callbacks.delete(result.id);
            callback.resolve(result);
            /*
                        if ("error" in result) {
                            const { message, code, data } = result.error;
                            const error = makeError(message || "unkonwn error", "SERVER_ERROR", {
                                request: `ws:${ JSON.stringify(callback.payload) }`,
                                info: { code, data }
                            });
                            callback.reject(error);
                        } else {
                            callback.resolve(result.result);
                        }
            */
        }
        else if (result.method === "eth_subscription") {
            const filterId = result.params.subscription;
            const subscriber = this.#subs.get(filterId);
            if (subscriber) {
                subscriber._handleMessage(result.params.result);
            }
            else {
                let pending = this.#pending.get(filterId);
                if (pending == null) {
                    pending = [];
                    this.#pending.set(filterId, pending);
                }
                pending.push(result.params.result);
            }
        }
    }
    async _write(message) {
        throw new Error("sub-classes must override this");
    }
}
exports.SocketProvider = SocketProvider;
//# sourceMappingURL=provider-socket.js.map