"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStore = exports.getStore = void 0;
function getStore(store, key) {
    return store[key];
}
exports.getStore = getStore;
function setStore(store, key, value) {
    if (Object.isFrozen(store)) {
        throw new Error(`frozen object is immuatable; cannot set ${String(key)}`);
    }
    store[key] = value;
}
exports.setStore = setStore;
//# sourceMappingURL=storage.js.map