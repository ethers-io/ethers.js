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
var _FilterIdSubscriber_instances, _FilterIdSubscriber_provider, _FilterIdSubscriber_filterIdPromise, _FilterIdSubscriber_poller, _FilterIdSubscriber_network, _FilterIdSubscriber_poll, _FilterIdSubscriber_teardown, _FilterIdEventSubscriber_event;
import { PollingEventSubscriber } from "./subscriber-polling.js";
function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
export class FilterIdSubscriber {
    constructor(provider) {
        _FilterIdSubscriber_instances.add(this);
        _FilterIdSubscriber_provider.set(this, void 0);
        _FilterIdSubscriber_filterIdPromise.set(this, void 0);
        _FilterIdSubscriber_poller.set(this, void 0);
        _FilterIdSubscriber_network.set(this, void 0);
        __classPrivateFieldSet(this, _FilterIdSubscriber_provider, provider, "f");
        __classPrivateFieldSet(this, _FilterIdSubscriber_filterIdPromise, null, "f");
        __classPrivateFieldSet(this, _FilterIdSubscriber_poller, __classPrivateFieldGet(this, _FilterIdSubscriber_instances, "m", _FilterIdSubscriber_poll).bind(this), "f");
        __classPrivateFieldSet(this, _FilterIdSubscriber_network, null, "f");
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
    start() { __classPrivateFieldGet(this, _FilterIdSubscriber_instances, "m", _FilterIdSubscriber_poll).call(this, -2); }
    stop() {
        __classPrivateFieldGet(this, _FilterIdSubscriber_instances, "m", _FilterIdSubscriber_teardown).call(this);
        __classPrivateFieldGet(this, _FilterIdSubscriber_provider, "f").off("block", __classPrivateFieldGet(this, _FilterIdSubscriber_poller, "f"));
    }
    pause(dropWhilePaused) {
        if (dropWhilePaused) {
            __classPrivateFieldGet(this, _FilterIdSubscriber_instances, "m", _FilterIdSubscriber_teardown).call(this);
        }
        __classPrivateFieldGet(this, _FilterIdSubscriber_provider, "f").off("block", __classPrivateFieldGet(this, _FilterIdSubscriber_poller, "f"));
    }
    resume() { this.start(); }
}
_FilterIdSubscriber_provider = new WeakMap(), _FilterIdSubscriber_filterIdPromise = new WeakMap(), _FilterIdSubscriber_poller = new WeakMap(), _FilterIdSubscriber_network = new WeakMap(), _FilterIdSubscriber_instances = new WeakSet(), _FilterIdSubscriber_poll = async function _FilterIdSubscriber_poll(blockNumber) {
    try {
        if (__classPrivateFieldGet(this, _FilterIdSubscriber_filterIdPromise, "f") == null) {
            __classPrivateFieldSet(this, _FilterIdSubscriber_filterIdPromise, this._subscribe(__classPrivateFieldGet(this, _FilterIdSubscriber_provider, "f")), "f");
        }
        const filterId = await __classPrivateFieldGet(this, _FilterIdSubscriber_filterIdPromise, "f");
        if (filterId == null) {
            __classPrivateFieldGet(this, _FilterIdSubscriber_provider, "f")._recoverSubscriber(this, this._recover(__classPrivateFieldGet(this, _FilterIdSubscriber_provider, "f")));
            return;
        }
        const network = await __classPrivateFieldGet(this, _FilterIdSubscriber_provider, "f").getNetwork();
        if (!__classPrivateFieldGet(this, _FilterIdSubscriber_network, "f")) {
            __classPrivateFieldSet(this, _FilterIdSubscriber_network, network, "f");
        }
        if (__classPrivateFieldGet(this, _FilterIdSubscriber_network, "f").chainId !== network.chainId) {
            throw new Error("chaid changed");
        }
        const result = await __classPrivateFieldGet(this, _FilterIdSubscriber_provider, "f").send("eth_getFilterChanges", [filterId]);
        await this._emitResults(__classPrivateFieldGet(this, _FilterIdSubscriber_provider, "f"), result);
    }
    catch (error) {
        console.log("@TODO", error);
    }
    __classPrivateFieldGet(this, _FilterIdSubscriber_provider, "f").once("block", __classPrivateFieldGet(this, _FilterIdSubscriber_poller, "f"));
}, _FilterIdSubscriber_teardown = function _FilterIdSubscriber_teardown() {
    const filterIdPromise = __classPrivateFieldGet(this, _FilterIdSubscriber_filterIdPromise, "f");
    if (filterIdPromise) {
        __classPrivateFieldSet(this, _FilterIdSubscriber_filterIdPromise, null, "f");
        filterIdPromise.then((filterId) => {
            __classPrivateFieldGet(this, _FilterIdSubscriber_provider, "f").send("eth_uninstallFilter", [filterId]);
        });
    }
};
export class FilterIdEventSubscriber extends FilterIdSubscriber {
    constructor(provider, filter) {
        super(provider);
        _FilterIdEventSubscriber_event.set(this, void 0);
        __classPrivateFieldSet(this, _FilterIdEventSubscriber_event, copy(filter), "f");
    }
    _recover(provider) {
        return new PollingEventSubscriber(provider, __classPrivateFieldGet(this, _FilterIdEventSubscriber_event, "f"));
    }
    async _subscribe(provider) {
        const filterId = await provider.send("eth_newFilter", [__classPrivateFieldGet(this, _FilterIdEventSubscriber_event, "f")]);
        console.log("____SUB", filterId);
        return filterId;
    }
    async _emitResults(provider, results) {
        const network = await provider.getNetwork();
        for (const result of results) {
            const log = network.formatter.log(result, provider);
            provider.emit(__classPrivateFieldGet(this, _FilterIdEventSubscriber_event, "f"), log);
        }
    }
}
_FilterIdEventSubscriber_event = new WeakMap();
export class FilterIdPendingSubscriber extends FilterIdSubscriber {
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
//# sourceMappingURL=subscriber-filterid.js.map