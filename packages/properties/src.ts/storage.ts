export function getStore<T, P extends keyof T>(store: T, key: P): T[P] {
    return store[key];
}

export function setStore<T, P extends keyof T>(store: T, key: P, value: T[P]): void {
    if (Object.isFrozen(store)) {
        throw new Error("frozen object is immuatable; cannot set " + key);
    }
    store[key] = value;
}
