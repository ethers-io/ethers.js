"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterIdPendingSubscriber = exports.FilterIdEventSubscriber = exports.FilterIdSubscriber = void 0;
const subscriber_polling_js_1 = require("./subscriber-polling.js");
function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
class FilterIdSubscriber {
    #provider;
    #filterIdPromise;
    #poller;
    #network;
    constructor(provider) {
        this.#provider = provider;
        this.#filterIdPromise = null;
        this.#poller = this.#poll.bind(this);
        this.#network = null;
    }
    _subscribe(provider) {
        throw new Error("subclasses must override this");
    }
    _emitResults(provider, result) {
        throw new Error("subclasses must override this");
    }
    _recover(provider) {
        throw new Error("subclasses must override this");
    }
    async #poll(blockNumber) {
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
            if (!this.#network) {
                this.#network = network;
            }
            if (this.#network.chainId !== network.chainId) {
                throw new Error("chaid changed");
            }
            const result = await this.#provider.send("eth_getFilterChanges", [filterId]);
            await this._emitResults(this.#provider, result);
        }
        catch (error) {
            console.log("@TODO", error);
        }
        this.#provider.once("block", this.#poller);
    }
    #teardown() {
        const filterIdPromise = this.#filterIdPromise;
        if (filterIdPromise) {
            this.#filterIdPromise = null;
            filterIdPromise.then((filterId) => {
                this.#provider.send("eth_uninstallFilter", [filterId]);
            });
        }
    }
    start() { this.#poll(-2); }
    stop() {
        this.#teardown();
        this.#provider.off("block", this.#poller);
    }
    pause(dropWhilePaused) {
        if (dropWhilePaused) {
            this.#teardown();
        }
        this.#provider.off("block", this.#poller);
    }
    resume() { this.start(); }
}
exports.FilterIdSubscriber = FilterIdSubscriber;
class FilterIdEventSubscriber extends FilterIdSubscriber {
    #event;
    constructor(provider, filter) {
        super(provider);
        this.#event = copy(filter);
    }
    _recover(provider) {
        return new subscriber_polling_js_1.PollingEventSubscriber(provider, this.#event);
    }
    async _subscribe(provider) {
        const filterId = await provider.send("eth_newFilter", [this.#event]);
        console.log("____SUB", filterId);
        return filterId;
    }
    async _emitResults(provider, results) {
        const network = await provider.getNetwork();
        for (const result of results) {
            const log = network.formatter.log(result, provider);
            provider.emit(this.#event, log);
        }
    }
}
exports.FilterIdEventSubscriber = FilterIdEventSubscriber;
class FilterIdPendingSubscriber extends FilterIdSubscriber {
    async _subscribe(provider) {
        return await provider.send("eth_newPendingTransactionFilter", []);
    }
    async _emitResults(provider, results) {
        const network = await provider.getNetwork();
        for (const result of results) {
            provider.emit("pending", network.formatter.hash(result));
        }
    }
}
exports.FilterIdPendingSubscriber = FilterIdPendingSubscriber;
//# sourceMappingURL=subscriber-filterid.js.map