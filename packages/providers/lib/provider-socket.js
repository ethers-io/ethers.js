/**
 *  SocketProvider
 *
 *  Generic long-lived socket provider.
 *
 *  Sub-classing notes
 *  - a sub-class MUST call the `_start()` method once connected
 *  - a sub-class MUST override the `_write(string)` method
 *  - a sub-class MUST call `_processMessage(string)` for each message
 */
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
var _SocketSubscriber_provider, _SocketSubscriber_filter, _SocketSubscriber_filterId, _SocketSubscriber_paused, _SocketSubscriber_emitPromise, _SocketEventSubscriber_logFilter, _SocketEventSubscriber_formatter, _SocketProvider_callbacks, _SocketProvider_ready, _SocketProvider_subs, _SocketProvider_pending;
import { UnmanagedSubscriber } from "./abstract-provider.js";
import { logger } from "./logger.js";
import { JsonRpcApiProvider } from "./provider-jsonrpc.js";
export class SocketSubscriber {
    constructor(provider, filter) {
        _SocketSubscriber_provider.set(this, void 0);
        _SocketSubscriber_filter.set(this, void 0);
        _SocketSubscriber_filterId.set(this, void 0);
        _SocketSubscriber_paused.set(this, void 0);
        _SocketSubscriber_emitPromise.set(this, void 0);
        __classPrivateFieldSet(this, _SocketSubscriber_provider, provider, "f");
        __classPrivateFieldSet(this, _SocketSubscriber_filter, JSON.stringify(filter), "f");
        __classPrivateFieldSet(this, _SocketSubscriber_filterId, null, "f");
        __classPrivateFieldSet(this, _SocketSubscriber_paused, null, "f");
        __classPrivateFieldSet(this, _SocketSubscriber_emitPromise, null, "f");
    }
    get filter() { return JSON.parse(__classPrivateFieldGet(this, _SocketSubscriber_filter, "f")); }
    start() {
        __classPrivateFieldSet(this, _SocketSubscriber_filterId, __classPrivateFieldGet(this, _SocketSubscriber_provider, "f").send("eth_subscribe", this.filter).then((filterId) => {
            ;
            __classPrivateFieldGet(this, _SocketSubscriber_provider, "f")._register(filterId, this);
            return filterId;
        }), "f");
    }
    stop() {
        (__classPrivateFieldGet(this, _SocketSubscriber_filterId, "f")).then((filterId) => {
            __classPrivateFieldGet(this, _SocketSubscriber_provider, "f").send("eth_unsubscribe", [filterId]);
        });
        __classPrivateFieldSet(this, _SocketSubscriber_filterId, null, "f");
    }
    // @TODO: pause should trap the current blockNumber, unsub, and on resume use getLogs
    //        and resume
    pause(dropWhilePaused) {
        if (!dropWhilePaused) {
            logger.throwError("preserve logs while paused not supported by SocketSubscriber yet", "UNSUPPORTED_OPERATION", {
                operation: "pause(false)"
            });
        }
        __classPrivateFieldSet(this, _SocketSubscriber_paused, !!dropWhilePaused, "f");
    }
    resume() {
        __classPrivateFieldSet(this, _SocketSubscriber_paused, null, "f");
    }
    _handleMessage(message) {
        if (__classPrivateFieldGet(this, _SocketSubscriber_filterId, "f") == null) {
            return;
        }
        if (__classPrivateFieldGet(this, _SocketSubscriber_paused, "f") === null) {
            let emitPromise = __classPrivateFieldGet(this, _SocketSubscriber_emitPromise, "f");
            if (emitPromise == null) {
                emitPromise = this._emit(__classPrivateFieldGet(this, _SocketSubscriber_provider, "f"), message);
            }
            else {
                emitPromise = emitPromise.then(async () => {
                    await this._emit(__classPrivateFieldGet(this, _SocketSubscriber_provider, "f"), message);
                });
            }
            __classPrivateFieldSet(this, _SocketSubscriber_emitPromise, emitPromise.then(() => {
                if (__classPrivateFieldGet(this, _SocketSubscriber_emitPromise, "f") === emitPromise) {
                    __classPrivateFieldSet(this, _SocketSubscriber_emitPromise, null, "f");
                }
            }), "f");
        }
    }
    async _emit(provider, message) {
        throw new Error("sub-classes must implemente this; _emit");
    }
}
_SocketSubscriber_provider = new WeakMap(), _SocketSubscriber_filter = new WeakMap(), _SocketSubscriber_filterId = new WeakMap(), _SocketSubscriber_paused = new WeakMap(), _SocketSubscriber_emitPromise = new WeakMap();
export class SocketBlockSubscriber extends SocketSubscriber {
    constructor(provider) {
        super(provider, ["newHeads"]);
    }
    async _emit(provider, message) {
        provider.emit("block", parseInt(message.number));
    }
}
export class SocketPendingSubscriber extends SocketSubscriber {
    constructor(provider) {
        super(provider, ["newPendingTransactions"]);
    }
    async _emit(provider, message) {
        provider.emit("pending", message);
    }
}
export class SocketEventSubscriber extends SocketSubscriber {
    constructor(provider, filter) {
        super(provider, ["logs", filter]);
        _SocketEventSubscriber_logFilter.set(this, void 0);
        _SocketEventSubscriber_formatter.set(this, void 0);
        __classPrivateFieldSet(this, _SocketEventSubscriber_logFilter, JSON.stringify(filter), "f");
        __classPrivateFieldSet(this, _SocketEventSubscriber_formatter, provider.getNetwork().then((network) => network.formatter), "f");
    }
    get logFilter() { return JSON.parse(__classPrivateFieldGet(this, _SocketEventSubscriber_logFilter, "f")); }
    async _emit(provider, message) {
        const formatter = await __classPrivateFieldGet(this, _SocketEventSubscriber_formatter, "f");
        provider.emit(__classPrivateFieldGet(this, _SocketEventSubscriber_logFilter, "f"), formatter.log(message, provider));
    }
}
_SocketEventSubscriber_logFilter = new WeakMap(), _SocketEventSubscriber_formatter = new WeakMap();
export class SocketProvider extends JsonRpcApiProvider {
    constructor(network) {
        super(network);
        _SocketProvider_callbacks.set(this, void 0);
        _SocketProvider_ready.set(this, void 0);
        // Maps each filterId to its subscriber
        _SocketProvider_subs.set(this, void 0);
        // If any events come in before a subscriber has finished
        // registering, queue them
        _SocketProvider_pending.set(this, void 0);
        __classPrivateFieldSet(this, _SocketProvider_callbacks, new Map(), "f");
        __classPrivateFieldSet(this, _SocketProvider_ready, false, "f");
        __classPrivateFieldSet(this, _SocketProvider_subs, new Map(), "f");
        __classPrivateFieldSet(this, _SocketProvider_pending, new Map(), "f");
    }
    _getSubscriber(sub) {
        switch (sub.type) {
            case "close":
                return new UnmanagedSubscriber("close");
            case "block":
                return new SocketBlockSubscriber(this);
            case "pending":
                return new SocketPendingSubscriber(this);
            case "event":
                return new SocketEventSubscriber(this, sub.filter);
            case "orphan":
                // Handled auto-matically within AbstractProvider
                // when the log.removed = true
                if (sub.filter.orphan === "drop-log") {
                    return new UnmanagedSubscriber("drop-log");
                }
        }
        return super._getSubscriber(sub);
    }
    _register(filterId, subscriber) {
        __classPrivateFieldGet(this, _SocketProvider_subs, "f").set(filterId, subscriber);
        const pending = __classPrivateFieldGet(this, _SocketProvider_pending, "f").get(filterId);
        if (pending) {
            for (const message of pending) {
                subscriber._handleMessage(message);
            }
            __classPrivateFieldGet(this, _SocketProvider_pending, "f").delete(filterId);
        }
    }
    async send(method, params) {
        const payload = this.prepareRequest(method, params);
        const promise = new Promise((resolve, reject) => {
            __classPrivateFieldGet(this, _SocketProvider_callbacks, "f").set(payload.id, { payload, resolve, reject });
        });
        if (__classPrivateFieldGet(this, _SocketProvider_ready, "f")) {
            await this._write(JSON.stringify(payload));
        }
        return await promise;
    }
    // Sub-classes must call this once they are connected
    async _start() {
        if (__classPrivateFieldGet(this, _SocketProvider_ready, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _SocketProvider_ready, true, "f");
        for (const { payload } of __classPrivateFieldGet(this, _SocketProvider_callbacks, "f").values()) {
            await this._write(JSON.stringify(payload));
        }
    }
    // Sub-classes must call this for each message
    async _processMessage(message) {
        const result = JSON.parse(message);
        if ("id" in result) {
            const promise = __classPrivateFieldGet(this, _SocketProvider_callbacks, "f").get(result.id);
            if (!promise) {
                console.log("Weird... Response for not a thing we sent");
                return;
            }
            __classPrivateFieldGet(this, _SocketProvider_callbacks, "f").delete(result.id);
            if ("error" in result) {
                const { message, code, data } = result.error;
                const error = logger.makeError(message || "unkonwn error", "SERVER_ERROR", {
                    request: `ws:${JSON.stringify(promise.payload)}`,
                    info: { code, data }
                });
                promise.reject(error);
            }
            else {
                promise.resolve(result.result);
            }
        }
        else if (result.method === "eth_subscription") {
            const filterId = result.params.subscription;
            const subscriber = __classPrivateFieldGet(this, _SocketProvider_subs, "f").get(filterId);
            if (subscriber) {
                subscriber._handleMessage(result.params.result);
            }
            else {
                let pending = __classPrivateFieldGet(this, _SocketProvider_pending, "f").get(filterId);
                if (pending == null) {
                    pending = [];
                    __classPrivateFieldGet(this, _SocketProvider_pending, "f").set(filterId, pending);
                }
                pending.push(result.params.result);
            }
        }
    }
    async _write(message) {
        throw new Error("sub-classes must override this");
    }
}
_SocketProvider_callbacks = new WeakMap(), _SocketProvider_ready = new WeakMap(), _SocketProvider_subs = new WeakMap(), _SocketProvider_pending = new WeakMap();
//# sourceMappingURL=provider-socket.js.map