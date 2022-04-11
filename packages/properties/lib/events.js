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
var _EventPayload_listener;
import { defineProperties } from "./properties.js";
export class EventPayload {
    constructor(emitter, listener, filter) {
        _EventPayload_listener.set(this, void 0);
        __classPrivateFieldSet(this, _EventPayload_listener, listener, "f");
        defineProperties(this, { emitter, filter });
    }
    async removeListener() {
        if (__classPrivateFieldGet(this, _EventPayload_listener, "f") == null) {
            return;
        }
        await this.emitter.off(this.filter, __classPrivateFieldGet(this, _EventPayload_listener, "f"));
    }
}
_EventPayload_listener = new WeakMap();
//# sourceMappingURL=events.js.map