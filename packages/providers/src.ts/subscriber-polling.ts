import { isHexString } from "@ethersproject/bytes";

import type { Subscriber } from "./abstract-provider.js";
import type { EventFilter, OrphanFilter, Provider, ProviderEvent } from "./provider.js";

import { logger } from "./logger.js";

function copy(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
}

export function getPollingSubscriber(provider: Provider, event: ProviderEvent): Subscriber {
    if (event === "block") { return new PollingBlockSubscriber(provider); }
    if (isHexString(event, 32)) { return new PollingTransactionSubscriber(provider, event); }

    return logger.throwError("unsupported polling event", "UNSUPPORTED_OPERATION", {
        operation: "getPollingSubscriber", info: { event }
    });
}

// @TODO: refactor this

export class PollingBlockSubscriber implements Subscriber{
    #provider: Provider;
    #poller: null | NodeJS.Timer;

    #interval: number;

    // The most recent block we have scanned for events. The value -2
    // indicates we still need to fetch an initial block number
    #blockNumber: number;

    constructor(provider: Provider) {
        this.#provider = provider;
        this.#poller = null;
        this.#interval = 4000;

        this.#blockNumber = -2;
    }

    get pollingInterval(): number { return this.#interval; }
    set pollingInterval(value: number) { this.#interval = value; }

    async #poll(): Promise<void> {
        const blockNumber = await this.#provider.getBlockNumber();
        if (this.#blockNumber === -2) {
            this.#blockNumber = blockNumber;
            return;
        }

        // @TODO: Put a cap on the maximum number of events per loop?

        if (blockNumber !== this.#blockNumber) {
            for (let b = this.#blockNumber + 1; b <= blockNumber; b++) {
                this.#provider.emit("block", b);
            }

            this.#blockNumber = blockNumber;
        }

        this.#poller = setTimeout(this.#poll.bind(this), this.#interval);
    }

    start(): void {
        if (this.#poller) { throw new Error("subscriber already running"); }
        this.#poll();
        this.#poller = setTimeout(this.#poll.bind(this), this.#interval);
    }

    stop(): void {
        if (!this.#poller) { throw new Error("subscriber not running"); }
        clearTimeout(this.#poller);
        this.#poller = null;
    }

    pause(dropWhilePaused?: boolean): void {
        this.stop();
        if (dropWhilePaused) { this.#blockNumber = -2; }
    }

    resume(): void {
        this.start();
    }
}

export class OnBlockSubscriber implements Subscriber {
    #provider: Provider;
    #poll: (b: number) => void;

    constructor(provider: Provider) {
        this.#provider = provider;
        this.#poll = (blockNumber: number) => {
            this._poll(blockNumber, this.#provider);
        }
    }

    async _poll(blockNumber: number, provider: Provider): Promise<void> {
        throw new Error("sub-classes must override this");
    }

    start(): void {
        this.#poll(-2);
        this.#provider.on("block", this.#poll);
    }

    stop(): void {
        this.#provider.off("block", this.#poll);
    }

    pause(dropWhilePaused?: boolean): void { this.stop(); }
    resume(): void { this.start(); }
}

export class PollingOrphanSubscriber extends OnBlockSubscriber {
    #filter: OrphanFilter;

    constructor(provider: Provider, filter: OrphanFilter) {
        super(provider);
        this.#filter = copy(filter);
    }

    async _poll(blockNumber: number, provider: Provider): Promise<void> {
        console.log(this.#filter);
        throw new Error("@TODO");
    }
}

export class PollingTransactionSubscriber extends OnBlockSubscriber {
    #hash: string;

    constructor(provider: Provider, hash: string) {
        super(provider);
        this.#hash = hash;
    }

    async _poll(blockNumber: number, provider: Provider): Promise<void> {
        const tx = await provider.getTransactionReceipt(this.#hash);
        if (tx) { provider.emit(this.#hash, tx); }
    }
}

export class PollingEventSubscriber implements Subscriber {
    #provider: Provider;
    #filter: EventFilter;
    #poller: (b: number) => void;

    // The most recent block we have scanned for events. The value -2
    // indicates we still need to fetch an initial block number
    #blockNumber: number;

    constructor(provider: Provider, filter: EventFilter) {
        this.#provider = provider;
        this.#filter = copy(filter);
        this.#poller = this.#poll.bind(this);
        this.#blockNumber = -2;
    }

    async #poll(blockNumber: number): Promise<void> {
        // The initial block hasn't been determined yet
        if (this.#blockNumber === -2) { return; }

        const filter = copy(this.#filter);
        filter.fromBlock = this.#blockNumber + 1;
        filter.toBlock = blockNumber;

        this.#blockNumber = blockNumber;
        const logs = await this.#provider.getLogs(filter);

        for (const log of logs) {
            this.#provider.emit(this.#filter, log);
        }
    }

    start(): void {
        if (this.#blockNumber === -2) {
            this.#provider.getBlockNumber().then((blockNumber) => {
                this.#blockNumber = blockNumber;
            });
        }
        this.#provider.on("block", this.#poller);
    }

    stop(): void {
        this.#provider.off("block", this.#poller);
    }

    pause(dropWhilePaused?: boolean): void {
        this.stop();
        if (dropWhilePaused) { this.#blockNumber = -2; }
    }

    resume(): void {
        this.start();
    }
}
