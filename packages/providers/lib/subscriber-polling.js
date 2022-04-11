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
var _PollingBlockSubscriber_instances, _PollingBlockSubscriber_provider, _PollingBlockSubscriber_poller, _PollingBlockSubscriber_interval, _PollingBlockSubscriber_blockNumber, _PollingBlockSubscriber_poll, _OnBlockSubscriber_provider, _OnBlockSubscriber_poll, _PollingOrphanSubscriber_filter, _PollingTransactionSubscriber_hash, _PollingEventSubscriber_instances, _PollingEventSubscriber_provider, _PollingEventSubscriber_filter, _PollingEventSubscriber_poller, _PollingEventSubscriber_blockNumber, _PollingEventSubscriber_poll;
import { isHexString } from "@ethersproject/bytes";
import { logger } from "./logger.js";
function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
export function getPollingSubscriber(provider, event) {
    if (event === "block") {
        return new PollingBlockSubscriber(provider);
    }
    if (isHexString(event, 32)) {
        return new PollingTransactionSubscriber(provider, event);
    }
    return logger.throwError("unsupported polling event", "UNSUPPORTED_OPERATION", {
        operation: "getPollingSubscriber", info: { event }
    });
}
// @TODO: refactor this
export class PollingBlockSubscriber {
    constructor(provider) {
        _PollingBlockSubscriber_instances.add(this);
        _PollingBlockSubscriber_provider.set(this, void 0);
        _PollingBlockSubscriber_poller.set(this, void 0);
        _PollingBlockSubscriber_interval.set(this, void 0);
        // The most recent block we have scanned for events. The value -2
        // indicates we still need to fetch an initial block number
        _PollingBlockSubscriber_blockNumber.set(this, void 0);
        __classPrivateFieldSet(this, _PollingBlockSubscriber_provider, provider, "f");
        __classPrivateFieldSet(this, _PollingBlockSubscriber_poller, null, "f");
        __classPrivateFieldSet(this, _PollingBlockSubscriber_interval, 4000, "f");
        __classPrivateFieldSet(this, _PollingBlockSubscriber_blockNumber, -2, "f");
    }
    get pollingInterval() { return __classPrivateFieldGet(this, _PollingBlockSubscriber_interval, "f"); }
    set pollingInterval(value) { __classPrivateFieldSet(this, _PollingBlockSubscriber_interval, value, "f"); }
    start() {
        if (__classPrivateFieldGet(this, _PollingBlockSubscriber_poller, "f")) {
            throw new Error("subscriber already running");
        }
        __classPrivateFieldGet(this, _PollingBlockSubscriber_instances, "m", _PollingBlockSubscriber_poll).call(this);
        __classPrivateFieldSet(this, _PollingBlockSubscriber_poller, setTimeout(__classPrivateFieldGet(this, _PollingBlockSubscriber_instances, "m", _PollingBlockSubscriber_poll).bind(this), __classPrivateFieldGet(this, _PollingBlockSubscriber_interval, "f")), "f");
    }
    stop() {
        if (!__classPrivateFieldGet(this, _PollingBlockSubscriber_poller, "f")) {
            throw new Error("subscriber not running");
        }
        clearTimeout(__classPrivateFieldGet(this, _PollingBlockSubscriber_poller, "f"));
        __classPrivateFieldSet(this, _PollingBlockSubscriber_poller, null, "f");
    }
    pause(dropWhilePaused) {
        this.stop();
        if (dropWhilePaused) {
            __classPrivateFieldSet(this, _PollingBlockSubscriber_blockNumber, -2, "f");
        }
    }
    resume() {
        this.start();
    }
}
_PollingBlockSubscriber_provider = new WeakMap(), _PollingBlockSubscriber_poller = new WeakMap(), _PollingBlockSubscriber_interval = new WeakMap(), _PollingBlockSubscriber_blockNumber = new WeakMap(), _PollingBlockSubscriber_instances = new WeakSet(), _PollingBlockSubscriber_poll = async function _PollingBlockSubscriber_poll() {
    const blockNumber = await __classPrivateFieldGet(this, _PollingBlockSubscriber_provider, "f").getBlockNumber();
    if (__classPrivateFieldGet(this, _PollingBlockSubscriber_blockNumber, "f") === -2) {
        __classPrivateFieldSet(this, _PollingBlockSubscriber_blockNumber, blockNumber, "f");
        return;
    }
    // @TODO: Put a cap on the maximum number of events per loop?
    if (blockNumber !== __classPrivateFieldGet(this, _PollingBlockSubscriber_blockNumber, "f")) {
        for (let b = __classPrivateFieldGet(this, _PollingBlockSubscriber_blockNumber, "f") + 1; b <= blockNumber; b++) {
            __classPrivateFieldGet(this, _PollingBlockSubscriber_provider, "f").emit("block", b);
        }
        __classPrivateFieldSet(this, _PollingBlockSubscriber_blockNumber, blockNumber, "f");
    }
    __classPrivateFieldSet(this, _PollingBlockSubscriber_poller, setTimeout(__classPrivateFieldGet(this, _PollingBlockSubscriber_instances, "m", _PollingBlockSubscriber_poll).bind(this), __classPrivateFieldGet(this, _PollingBlockSubscriber_interval, "f")), "f");
};
export class OnBlockSubscriber {
    constructor(provider) {
        _OnBlockSubscriber_provider.set(this, void 0);
        _OnBlockSubscriber_poll.set(this, void 0);
        __classPrivateFieldSet(this, _OnBlockSubscriber_provider, provider, "f");
        __classPrivateFieldSet(this, _OnBlockSubscriber_poll, (blockNumber) => {
            this._poll(blockNumber, __classPrivateFieldGet(this, _OnBlockSubscriber_provider, "f"));
        }, "f");
    }
    async _poll(blockNumber, provider) {
        throw new Error("sub-classes must override this");
    }
    start() {
        __classPrivateFieldGet(this, _OnBlockSubscriber_poll, "f").call(this, -2);
        __classPrivateFieldGet(this, _OnBlockSubscriber_provider, "f").on("block", __classPrivateFieldGet(this, _OnBlockSubscriber_poll, "f"));
    }
    stop() {
        __classPrivateFieldGet(this, _OnBlockSubscriber_provider, "f").off("block", __classPrivateFieldGet(this, _OnBlockSubscriber_poll, "f"));
    }
    pause(dropWhilePaused) { this.stop(); }
    resume() { this.start(); }
}
_OnBlockSubscriber_provider = new WeakMap(), _OnBlockSubscriber_poll = new WeakMap();
export class PollingOrphanSubscriber extends OnBlockSubscriber {
    constructor(provider, filter) {
        super(provider);
        _PollingOrphanSubscriber_filter.set(this, void 0);
        __classPrivateFieldSet(this, _PollingOrphanSubscriber_filter, copy(filter), "f");
    }
    async _poll(blockNumber, provider) {
        console.log(__classPrivateFieldGet(this, _PollingOrphanSubscriber_filter, "f"));
        throw new Error("@TODO");
    }
}
_PollingOrphanSubscriber_filter = new WeakMap();
export class PollingTransactionSubscriber extends OnBlockSubscriber {
    constructor(provider, hash) {
        super(provider);
        _PollingTransactionSubscriber_hash.set(this, void 0);
        __classPrivateFieldSet(this, _PollingTransactionSubscriber_hash, hash, "f");
    }
    async _poll(blockNumber, provider) {
        const tx = await provider.getTransactionReceipt(__classPrivateFieldGet(this, _PollingTransactionSubscriber_hash, "f"));
        if (tx) {
            provider.emit(__classPrivateFieldGet(this, _PollingTransactionSubscriber_hash, "f"), tx);
        }
    }
}
_PollingTransactionSubscriber_hash = new WeakMap();
export class PollingEventSubscriber {
    constructor(provider, filter) {
        _PollingEventSubscriber_instances.add(this);
        _PollingEventSubscriber_provider.set(this, void 0);
        _PollingEventSubscriber_filter.set(this, void 0);
        _PollingEventSubscriber_poller.set(this, void 0);
        // The most recent block we have scanned for events. The value -2
        // indicates we still need to fetch an initial block number
        _PollingEventSubscriber_blockNumber.set(this, void 0);
        __classPrivateFieldSet(this, _PollingEventSubscriber_provider, provider, "f");
        __classPrivateFieldSet(this, _PollingEventSubscriber_filter, copy(filter), "f");
        __classPrivateFieldSet(this, _PollingEventSubscriber_poller, __classPrivateFieldGet(this, _PollingEventSubscriber_instances, "m", _PollingEventSubscriber_poll).bind(this), "f");
        __classPrivateFieldSet(this, _PollingEventSubscriber_blockNumber, -2, "f");
    }
    start() {
        if (__classPrivateFieldGet(this, _PollingEventSubscriber_blockNumber, "f") === -2) {
            __classPrivateFieldGet(this, _PollingEventSubscriber_provider, "f").getBlockNumber().then((blockNumber) => {
                __classPrivateFieldSet(this, _PollingEventSubscriber_blockNumber, blockNumber, "f");
            });
        }
        __classPrivateFieldGet(this, _PollingEventSubscriber_provider, "f").on("block", __classPrivateFieldGet(this, _PollingEventSubscriber_poller, "f"));
    }
    stop() {
        __classPrivateFieldGet(this, _PollingEventSubscriber_provider, "f").off("block", __classPrivateFieldGet(this, _PollingEventSubscriber_poller, "f"));
    }
    pause(dropWhilePaused) {
        this.stop();
        if (dropWhilePaused) {
            __classPrivateFieldSet(this, _PollingEventSubscriber_blockNumber, -2, "f");
        }
    }
    resume() {
        this.start();
    }
}
_PollingEventSubscriber_provider = new WeakMap(), _PollingEventSubscriber_filter = new WeakMap(), _PollingEventSubscriber_poller = new WeakMap(), _PollingEventSubscriber_blockNumber = new WeakMap(), _PollingEventSubscriber_instances = new WeakSet(), _PollingEventSubscriber_poll = async function _PollingEventSubscriber_poll(blockNumber) {
    // The initial block hasn't been determined yet
    if (__classPrivateFieldGet(this, _PollingEventSubscriber_blockNumber, "f") === -2) {
        return;
    }
    const filter = copy(__classPrivateFieldGet(this, _PollingEventSubscriber_filter, "f"));
    filter.fromBlock = __classPrivateFieldGet(this, _PollingEventSubscriber_blockNumber, "f") + 1;
    filter.toBlock = blockNumber;
    __classPrivateFieldSet(this, _PollingEventSubscriber_blockNumber, blockNumber, "f");
    const logs = await __classPrivateFieldGet(this, _PollingEventSubscriber_provider, "f").getLogs(filter);
    for (const log of logs) {
        __classPrivateFieldGet(this, _PollingEventSubscriber_provider, "f").emit(__classPrivateFieldGet(this, _PollingEventSubscriber_filter, "f"), log);
    }
};
//# sourceMappingURL=subscriber-polling.js.map