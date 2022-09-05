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
import { UnmanagedSubscriber } from "./abstract-provider.js";
import { assertArgument, logger } from "../utils/logger.js";
import { JsonRpcApiProvider } from "./provider-jsonrpc.js";
export class SocketSubscriber {
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
        if (!dropWhilePaused) {
            logger.throwError("preserve logs while paused not supported by SocketSubscriber yet", "UNSUPPORTED_OPERATION", {
                operation: "pause(false)"
            });
        }
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
    #logFilter;
    get logFilter() { return JSON.parse(this.#logFilter); }
    #formatter;
    constructor(provider, filter) {
        super(provider, ["logs", filter]);
        this.#logFilter = JSON.stringify(filter);
        this.#formatter = provider.getNetwork().then((network) => network.formatter);
    }
    async _emit(provider, message) {
        const formatter = await this.#formatter;
        provider.emit(this.#logFilter, formatter.log(message, provider));
    }
}
export class SocketProvider extends JsonRpcApiProvider {
    #callbacks;
    #ready;
    // Maps each filterId to its subscriber
    #subs;
    // If any events come in before a subscriber has finished
    // registering, queue them
    #pending;
    constructor(network) {
        super(network, { batchMaxCount: 1 });
        this.#callbacks = new Map();
        this.#ready = false;
        this.#subs = new Map();
        this.#pending = new Map();
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
        assertArgument(!Array.isArray(payload), "WebSocket does not support batch send", "payload", payload);
        // @TODO: stringify payloads here and store to prevent mutations
        const promise = new Promise((resolve, reject) => {
            this.#callbacks.set(payload.id, { payload, resolve, reject });
        });
        if (this.#ready) {
            await this._write(JSON.stringify(payload));
        }
        return [await promise];
    }
    // Sub-classes must call this once they are connected
    async _start() {
        if (this.#ready) {
            return;
        }
        this.#ready = true;
        for (const { payload } of this.#callbacks.values()) {
            await this._write(JSON.stringify(payload));
        }
    }
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
            if ("error" in result) {
                const { message, code, data } = result.error;
                const error = logger.makeError(message || "unkonwn error", "SERVER_ERROR", {
                    request: `ws:${JSON.stringify(callback.payload)}`,
                    info: { code, data }
                });
                callback.reject(error);
            }
            else {
                callback.resolve(result.result);
            }
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
//# sourceMappingURL=provider-socket.js.map