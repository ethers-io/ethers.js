export function getStore(store, key) {
    return store[key];
}
export function setStore(store, key, value) {
    if (Object.isFrozen(store)) {
        throw new Error("frozen object is immuatable; cannot set " + key);
    }
    store[key] = value;
}
//# sourceMappingURL=storage.js.map