import { assert, isHexString } from "../utils/index.js";
function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 *  @TODO
 *
 *  @_docloc: api/providers/abstract-provider
 */
export function getPollingSubscriber(provider, event) {
    if (event === "block") {
        return new PollingBlockSubscriber(provider);
    }
    if (isHexString(event, 32)) {
        return new PollingTransactionSubscriber(provider, event);
    }
    assert(false, "unsupported polling event", "UNSUPPORTED_OPERATION", {
        operation: "getPollingSubscriber", info: { event }
    });
}
// @TODO: refactor this
/**
 *  @TODO
 *
 *  @_docloc: api/providers/abstract-provider
 */
export class PollingBlockSubscriber {
    #provider;
    #poller;
    #interval;
    // The most recent block we have scanned for events. The value -2
    // indicates we still need to fetch an initial block number
    #blockNumber;
    constructor(provider) {
        this.#provider = provider;
        this.#poller = null;
        this.#interval = 4000;
        this.#blockNumber = -2;
    }
    get pollingInterval() { return this.#interval; }
    set pollingInterval(value) { this.#interval = value; }
    async #poll() {
        try {
            const blockNumber = await this.#provider.getBlockNumber();
            // Bootstrap poll to setup our initial block number
            if (this.#blockNumber === -2) {
                this.#blockNumber = blockNumber;
                return;
            }
            // @TODO: Put a cap on the maximum number of events per loop?
            if (blockNumber !== this.#blockNumber) {
                for (let b = this.#blockNumber + 1; b <= blockNumber; b++) {
                    // We have been stopped
                    if (this.#poller == null) {
                        return;
                    }
                    await this.#provider.emit("block", b);
                }
                this.#blockNumber = blockNumber;
            }
        }
        catch (error) {
            // @TODO: Minor bump, add an "error" event to let subscribers
            //        know things went awry.
            //console.log(error);
        }
        // We have been stopped
        if (this.#poller == null) {
            return;
        }
        this.#poller = this.#provider._setTimeout(this.#poll.bind(this), this.#interval);
    }
    start() {
        if (this.#poller) {
            return;
        }
        this.#poller = this.#provider._setTimeout(this.#poll.bind(this), this.#interval);
        this.#poll();
    }
    stop() {
        if (!this.#poller) {
            return;
        }
        this.#provider._clearTimeout(this.#poller);
        this.#poller = null;
    }
    pause(dropWhilePaused) {
        this.stop();
        if (dropWhilePaused) {
            this.#blockNumber = -2;
        }
    }
    resume() {
        this.start();
    }
}
/**
 *  @TODO
 *
 *  @_docloc: api/providers/abstract-provider
 */
export class OnBlockSubscriber {
    #provider;
    #poll;
    #running;
    constructor(provider) {
        this.#provider = provider;
        this.#running = false;
        this.#poll = (blockNumber) => {
            this._poll(blockNumber, this.#provider);
        };
    }
    async _poll(blockNumber, provider) {
        throw new Error("sub-classes must override this");
    }
    start() {
        if (this.#running) {
            return;
        }
        this.#running = true;
        this.#poll(-2);
        this.#provider.on("block", this.#poll);
    }
    stop() {
        if (!this.#running) {
            return;
        }
        this.#running = false;
        this.#provider.off("block", this.#poll);
    }
    pause(dropWhilePaused) { this.stop(); }
    resume() { this.start(); }
}
/**
 *  @TODO
 *
 *  @_docloc: api/providers/abstract-provider
 */
export class PollingOrphanSubscriber extends OnBlockSubscriber {
    #filter;
    constructor(provider, filter) {
        super(provider);
        this.#filter = copy(filter);
    }
    async _poll(blockNumber, provider) {
        throw new Error("@TODO");
        console.log(this.#filter);
    }
}
/**
 *  @TODO
 *
 *  @_docloc: api/providers/abstract-provider
 */
export class PollingTransactionSubscriber extends OnBlockSubscriber {
    #hash;
    constructor(provider, hash) {
        super(provider);
        this.#hash = hash;
    }
    async _poll(blockNumber, provider) {
        const tx = await provider.getTransactionReceipt(this.#hash);
        if (tx) {
            provider.emit(this.#hash, tx);
        }
    }
}
/**
 *  @TODO
 *
 *  @_docloc: api/providers/abstract-provider
 */
export class PollingEventSubscriber {
    #provider;
    #filter;
    #poller;
    #running;
    // The most recent block we have scanned for events. The value -2
    // indicates we still need to fetch an initial block number
    #blockNumber;
    constructor(provider, filter) {
        this.#provider = provider;
        this.#filter = copy(filter);
        this.#poller = this.#poll.bind(this);
        this.#running = false;
        this.#blockNumber = -2;
    }
    async #poll(blockNumber) {
        // The initial block hasn't been determined yet
        if (this.#blockNumber === -2) {
            return;
        }
        const filter = copy(this.#filter);
        filter.fromBlock = this.#blockNumber + 1;
        filter.toBlock = blockNumber;
        const logs = await this.#provider.getLogs(filter);
        // No logs could just mean the node has not indexed them yet,
        // so we keep a sliding window of 60 blocks to keep scanning
        if (logs.length === 0) {
            if (this.#blockNumber < blockNumber - 60) {
                this.#blockNumber = blockNumber - 60;
            }
            return;
        }
        this.#blockNumber = blockNumber;
        for (const log of logs) {
            this.#provider.emit(this.#filter, log);
        }
    }
    start() {
        if (this.#running) {
            return;
        }
        this.#running = true;
        if (this.#blockNumber === -2) {
            this.#provider.getBlockNumber().then((blockNumber) => {
                this.#blockNumber = blockNumber;
            });
        }
        this.#provider.on("block", this.#poller);
    }
    stop() {
        if (!this.#running) {
            return;
        }
        this.#running = false;
        this.#provider.off("block", this.#poller);
    }
    pause(dropWhilePaused) {
        this.stop();
        if (dropWhilePaused) {
            this.#blockNumber = -2;
        }
    }
    resume() {
        this.start();
    }
}
//# sourceMappingURL=subscriber-polling.js.map