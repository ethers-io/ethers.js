import { PollingEventSubscriber } from "./subscriber-polling.js";

import type { Frozen } from "@ethersproject/properties";

import type { Subscriber } from "./abstract-provider.js";
import type { Network } from "./network.js";
import type { EventFilter, Provider } from "./provider.js";
import type { JsonRpcApiProvider } from "./provider-jsonrpc.js";


function copy(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
}

export class FilterIdSubscriber implements Subscriber {
    #provider: JsonRpcApiProvider;

    #filterIdPromise: null | Promise<string>;
    #poller: (b: number) => Promise<void>;

    #network: null | Frozen<Network>;

    constructor(provider: JsonRpcApiProvider) {
        this.#provider = provider;

        this.#filterIdPromise = null;
        this.#poller = this.#poll.bind(this);

        this.#network = null;
    }

    _subscribe(provider: JsonRpcApiProvider): Promise<string> {
        throw new Error("subclasses must override this");
    }

    _emitResults(provider: Provider, result: Array<any>): Promise<void> {
        throw new Error("subclasses must override this");
    }

    _recover(provider: Provider): Subscriber {
        throw new Error("subclasses must override this");
    }

    async #poll(blockNumber: number): Promise<void> {
        try {
            if (this.#filterIdPromise == null) {
                this.#filterIdPromise = this._subscribe(this.#provider);
            }

            const filterId = await this.#filterIdPromise;
            if (filterId == null) {
                this.#provider._recoverSubscriber(this, this._recover(this.#provider));
                return;
            }

            const network = await this.#provider.getNetwork();
            if (!this.#network) { this.#network = network; }

            if ((this.#network as Network).chainId !== network.chainId) {
                throw new Error("chaid changed");
            }

            const result = await this.#provider.send("eth_getFilterChanges", [ filterId ]);
            await this._emitResults(this.#provider, result);
        } catch (error) { console.log("@TODO", error); }

        this.#provider.once("block", this.#poller);
    }

    #teardown(): void {
        const filterIdPromise = this.#filterIdPromise;
        if (filterIdPromise) {
            this.#filterIdPromise = null;
            filterIdPromise.then((filterId) => {
                this.#provider.send("eth_uninstallFilter", [ filterId ]);
            });
        }
    }

    start(): void { this.#poll(-2); }

    stop(): void {
        this.#teardown();
        this.#provider.off("block", this.#poller);
    }

    pause(dropWhilePaused?: boolean): void {
        if (dropWhilePaused){ this.#teardown(); }
        this.#provider.off("block", this.#poller);
    }

    resume(): void { this.start(); }
}

export class FilterIdEventSubscriber extends FilterIdSubscriber {
    #event: EventFilter;

    constructor(provider: JsonRpcApiProvider, filter: EventFilter) {
        super(provider);
        this.#event = copy(filter);
    }

    _recover(provider: Provider): Subscriber {
        return new PollingEventSubscriber(provider, this.#event);
    }

    async _subscribe(provider: JsonRpcApiProvider): Promise<string> {
        const filterId = await provider.send("eth_newFilter", [ this.#event ]);
        console.log("____SUB", filterId);
        return filterId;
    }

    async _emitResults(provider: JsonRpcApiProvider, results: Array<any>): Promise<void> {
        const network = await provider.getNetwork();
        for (const result of results) {
            const log = network.formatter.log(result, provider);
            provider.emit(this.#event, log);
        }
    }
}

export class FilterIdPendingSubscriber extends FilterIdSubscriber {
    async _subscribe(provider: JsonRpcApiProvider): Promise<string> {
        return await provider.send("eth_newPendingTransactionFilter", [ ]);
    }

    async _emitResults(provider: JsonRpcApiProvider, results: Array<any>): Promise<void> {
        const network = await provider.getNetwork();
        for (const result of results) {
            provider.emit("pending", network.formatter.hash(result));
        }
    }
}
