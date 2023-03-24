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
import { assert, assertArgument } from '../utils/index.js';
import { formatTransactionResponse } from './format.js';
import { JsonRpcApiProvider } from "./provider-jsonrpc.js";

import type { Subscriber, Subscription } from "./abstract-provider.js";
import { TransactionResponse } from './provider.js';
import type { EventFilter } from "./provider.js";
import type { JsonRpcError, JsonRpcPayload, JsonRpcResult } from "./provider-jsonrpc.js";
import type { Networkish } from "./network.js";


type JsonRpcSubscription = {
    method: string,
    params: {
        result: any,
        subscription: string
    }
};

export class SocketSubscriber implements Subscriber {
    #provider: SocketProvider;

    #filter: string;
    get filter(): Array<any> { return JSON.parse(this.#filter); }

    #filterId: null | Promise<string |number>;
    #paused: null | boolean;

    #emitPromise: null | Promise<void>;

    constructor(provider: SocketProvider, filter: Array<any>) {
        this.#provider = provider;
        this.#filter = JSON.stringify(filter);
        this.#filterId = null;
        this.#paused = null;
        this.#emitPromise = null;
    }

    start(): void {
        this.#filterId = this.#provider.send("eth_subscribe", this.filter).then((filterId) => {;
            this.#provider._register(filterId, this);
            return filterId;
        });
    }

    stop(): void {
        (<Promise<number>>(this.#filterId)).then((filterId) => {
            this.#provider.send("eth_unsubscribe", [ filterId ]);
        });
        this.#filterId = null;
    }

    // @TODO: pause should trap the current blockNumber, unsub, and on resume use getLogs
    //        and resume
    pause(dropWhilePaused?: boolean): void {
        assert(dropWhilePaused, "preserve logs while paused not supported by SocketSubscriber yet",
            "UNSUPPORTED_OPERATION", { operation: "pause(false)" });
        this.#paused = !!dropWhilePaused;
    }

    resume(): void {
        this.#paused = null;
    }

    _handleMessage(message: any): void {
        if (this.#filterId == null) { return; }
        if (this.#paused === null) {
            let emitPromise: null | Promise<void> = this.#emitPromise;
            if (emitPromise == null) {
                emitPromise = this._emit(this.#provider, message);
            } else {
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

    async _emit(provider: SocketProvider, message: any): Promise<void> {
        throw new Error("sub-classes must implemente this; _emit");
    }
}

export class SocketBlockSubscriber extends SocketSubscriber {
    constructor(provider: SocketProvider) {
        super(provider, [ "newHeads" ]);
    }

    async _emit(provider: SocketProvider, message: any): Promise<void> {
        provider.emit("block", parseInt(message.number));
    }
}

export class SocketPendingSubscriber extends SocketSubscriber {
    constructor(provider: SocketProvider) {
        super(provider, [ "newPendingTransactions" ]);
    }

    async _emit(provider: SocketProvider, message: any): Promise<void> {
        provider.emit("pending", message);
    }
}

export class SocketPendingFullSubscriber extends SocketSubscriber {
    constructor(provider: SocketProvider) {
        super(provider, [ "newPendingTransactions", true ]);
    }

    async _emit(provider: SocketProvider, message: any): Promise<void> {
        provider.emit("pending_full", new TransactionResponse(formatTransactionResponse(message), provider));
    }
}

export class SocketEventSubscriber extends SocketSubscriber {
    #logFilter: string;
    get logFilter(): EventFilter { return JSON.parse(this.#logFilter); }

    constructor(provider: SocketProvider, filter: EventFilter) {
        super(provider, [ "logs", filter ]);
        this.#logFilter = JSON.stringify(filter);
    }

    async _emit(provider: SocketProvider, message: any): Promise<void> {
        provider.emit(this.#logFilter, provider._wrapLog(message, provider._network));
    }
}

/**
 *  SocketProvider...
 *
 */
export class SocketProvider extends JsonRpcApiProvider {
    #callbacks: Map<number, { payload: JsonRpcPayload, resolve: (r: any) => void, reject: (e: Error) => void }>;

    // Maps each filterId to its subscriber
    #subs: Map<number | string, SocketSubscriber>;

    // If any events come in before a subscriber has finished
    // registering, queue them
    #pending: Map<number | string, Array<any>>;

    constructor(network?: Networkish) {
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

    _getSubscriber(sub: Subscription): Subscriber {
        switch (sub.type) {
            case "close":
                return new UnmanagedSubscriber("close");
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
                    return new UnmanagedSubscriber("drop-log");
                }
        }
        return super._getSubscriber(sub);
    }

    _register(filterId: number | string, subscriber: SocketSubscriber): void {
        this.#subs.set(filterId, subscriber);
        const pending = this.#pending.get(filterId);
        if (pending) {
            for (const message of pending) {
                subscriber._handleMessage(message);
            }
            this.#pending.delete(filterId);
        }
    }

    async _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult | JsonRpcError>> {
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

        return <Array<JsonRpcResult | JsonRpcError>>[ await promise ];
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
    async _processMessage(message: string): Promise<void> {
        const result = <JsonRpcResult | JsonRpcError | JsonRpcSubscription>(JSON.parse(message));

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
        } else if (result.method === "eth_subscription") {
            const filterId = result.params.subscription;
            const subscriber = this.#subs.get(filterId);
            if (subscriber) {
                subscriber._handleMessage(result.params.result);
            } else {
                let pending = this.#pending.get(filterId);
                if (pending == null) {
                    pending = [ ];
                    this.#pending.set(filterId, pending);
                }
                pending.push(result.params.result);
            }
        }
    }

    async _write(message: string): Promise<void> {
        throw new Error("sub-classes must override this");
    }
}
