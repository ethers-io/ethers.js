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
var _Signal_instances, _Signal_listeners, _Signal_reason, _Signal_timer, _Signal_invalidate, _Signal_makeError;
import { logger } from "./logger.js";
export class Signal {
    constructor(_timeout) {
        _Signal_instances.add(this);
        _Signal_listeners.set(this, void 0);
        _Signal_reason.set(this, void 0);
        _Signal_timer.set(this, void 0);
        __classPrivateFieldSet(this, _Signal_listeners, [], "f");
        __classPrivateFieldSet(this, _Signal_reason, null, "f");
        __classPrivateFieldSet(this, _Signal_timer, null, "f");
        if (_timeout != null) {
            __classPrivateFieldSet(this, _Signal_timer, setTimeout(() => {
                __classPrivateFieldGet(this, _Signal_instances, "m", _Signal_invalidate).call(this, "timeout");
            }, logger.getNumber(_timeout, "timeout")), "f");
            if (__classPrivateFieldGet(this, _Signal_timer, "f").unref) {
                __classPrivateFieldGet(this, _Signal_timer, "f").unref();
            }
        }
    }
    // Whether the Signal has been invalidated; if true, any newly added
    // llistener will immediately receive a "invalidated" event
    get invalidated() { return (__classPrivateFieldGet(this, _Signal_reason, "f") === "invalidated"); }
    // Sends a "cancel" signal to all listeners
    cancel() {
        return __classPrivateFieldGet(this, _Signal_instances, "m", _Signal_invalidate).call(this, "cancel");
    }
    invalidate() {
        return __classPrivateFieldGet(this, _Signal_instances, "m", _Signal_invalidate).call(this, "invalidated");
    }
    addListener(listener) {
        __classPrivateFieldGet(this, _Signal_listeners, "f").push(listener);
        if (__classPrivateFieldGet(this, _Signal_reason, "f")) {
            try {
                setTimeout(() => {
                    listener.call(this, __classPrivateFieldGet(this, _Signal_reason, "f"), __classPrivateFieldGet(this, _Signal_instances, "m", _Signal_makeError).call(this));
                }, 0);
            }
            catch (error) { }
        }
        return this;
    }
    removeListener(listener) {
        const index = __classPrivateFieldGet(this, _Signal_listeners, "f").indexOf(listener);
        if (index >= 0) {
            __classPrivateFieldGet(this, _Signal_listeners, "f").splice(index, 1);
        }
        return this;
    }
}
_Signal_listeners = new WeakMap(), _Signal_reason = new WeakMap(), _Signal_timer = new WeakMap(), _Signal_instances = new WeakSet(), _Signal_invalidate = function _Signal_invalidate(reason) {
    if (__classPrivateFieldGet(this, _Signal_reason, "f")) {
        return false;
    }
    if (__classPrivateFieldGet(this, _Signal_timer, "f") != null) {
        clearTimeout(__classPrivateFieldGet(this, _Signal_timer, "f"));
    }
    __classPrivateFieldSet(this, _Signal_reason, reason, "f");
    if (reason !== "invalidated") {
        const listeners = __classPrivateFieldGet(this, _Signal_listeners, "f").slice();
        listeners.forEach((listener) => {
            try {
                listener.call(this, reason, __classPrivateFieldGet(this, _Signal_instances, "m", _Signal_makeError).call(this));
            }
            catch (error) { }
        });
    }
    return true;
}, _Signal_makeError = function _Signal_makeError() {
    const reason = __classPrivateFieldGet(this, _Signal_reason, "f") || "unknown";
    return logger.makeError(reason, "TIMEOUT", { operation: "signal", reason });
};
//# sourceMappingURL=signal.js.map