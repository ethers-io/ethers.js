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
var _BlockConnectionSubscriber_provider, _BlockConnectionSubscriber_blockNumber, _BlockConnectionSubscriber_filterId;
import { logger } from "./logger.js";
export class BlockConnectionSubscriber {
    constructor(provider) {
        _BlockConnectionSubscriber_provider.set(this, void 0);
        _BlockConnectionSubscriber_blockNumber.set(this, void 0);
        _BlockConnectionSubscriber_filterId.set(this, void 0);
        __classPrivateFieldSet(this, _BlockConnectionSubscriber_provider, provider, "f");
        __classPrivateFieldSet(this, _BlockConnectionSubscriber_blockNumber, -2, "f");
        __classPrivateFieldSet(this, _BlockConnectionSubscriber_filterId, null, "f");
    }
    start() {
        __classPrivateFieldSet(this, _BlockConnectionSubscriber_filterId, __classPrivateFieldGet(this, _BlockConnectionSubscriber_provider, "f")._subscribe(["newHeads"], (result) => {
            const blockNumber = logger.getNumber(result.number);
            const initial = (__classPrivateFieldGet(this, _BlockConnectionSubscriber_blockNumber, "f") === -2) ? blockNumber : (__classPrivateFieldGet(this, _BlockConnectionSubscriber_blockNumber, "f") + 1);
            for (let b = initial; b <= blockNumber; b++) {
                __classPrivateFieldGet(this, _BlockConnectionSubscriber_provider, "f").emit("block", b);
            }
            __classPrivateFieldSet(this, _BlockConnectionSubscriber_blockNumber, blockNumber, "f");
        }), "f");
    }
    stop() {
        if (__classPrivateFieldGet(this, _BlockConnectionSubscriber_filterId, "f") != null) {
            __classPrivateFieldGet(this, _BlockConnectionSubscriber_provider, "f")._unsubscribe(__classPrivateFieldGet(this, _BlockConnectionSubscriber_filterId, "f"));
            __classPrivateFieldSet(this, _BlockConnectionSubscriber_filterId, null, "f");
        }
    }
    pause(dropWhilePaused) {
        if (dropWhilePaused) {
            __classPrivateFieldSet(this, _BlockConnectionSubscriber_blockNumber, -2, "f");
        }
        this.stop();
    }
    resume() {
        this.start();
    }
}
_BlockConnectionSubscriber_provider = new WeakMap(), _BlockConnectionSubscriber_blockNumber = new WeakMap(), _BlockConnectionSubscriber_filterId = new WeakMap();
//# sourceMappingURL=subscriber-connection.js.map