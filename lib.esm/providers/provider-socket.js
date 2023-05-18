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
import { UnmanagedSubscriber } from "./abstract-provider.js";
import { assert, assertArgument, makeError } from "../utils/index.js";
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
        assert(dropWhilePaused, "preserve logs while paused not supported by SocketSubscriber yet", "UNSUPPORTED_OPERATION", { operation: "pause(false)" });
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
    constructor(provider, filter) {
        super(provider, ["logs", filter]);
        this.#logFilter = JSON.stringify(filter);
    }
    async _emit(provider, message) {
        provider.emit(this.logFilter, provider._wrapLog(message, provider._network));
    }
}
/**
 *  SocketProvider...
 *
 */
export class SocketProvider extends JsonRpcApiProvider {
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
        if (result && typeof (result) === "object" && "id" in result) {
            const callback = this.#callbacks.get(result.id);
            if (callback == null) {
                this.emit("error", makeError("received result for unknown id", "UNKNOWN_ERROR", {
                    reasonCode: "UNKNOWN_ID",
                    result
                }));
                return;
            }
            this.#callbacks.delete(result.id);
            callback.resolve(result);
        }
        else if (result && result.method === "eth_subscription") {
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
        else {
            this.emit("error", makeError("received unexpected message", "UNKNOWN_ERROR", {
                reasonCode: "UNEXPECTED_MESSAGE",
                result
            }));
            return;
        }
    }
    async _write(message) {
        throw new Error("sub-classes must override this");
    }
}
//# sourceMappingURL=provider-socket.js.map