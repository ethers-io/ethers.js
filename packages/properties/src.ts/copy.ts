/*
const immutable = Symbol.for("_ethersInternalImmutable");
const valueImmutable = "immutable";

export function markImmutable(value: any): void {
    value[immutable] = valueImmutable;
}

export function unmarkImmutable(value: any): void {
    value[immutable] = "";
}

class WrappedAddress {
    #promise: Promise<string>;

    constructor(promise: Promise<string>) {
        this.#promise = promise;
    }

    async getAddress(): Promise<string> {
        return this.#promise;
    }
}

const primitives = "bigint,boolean,function,number,string,symbol".split(/,/);
function _deepCopy(value: any): any {
    // null or something primitive and therefore immutable
    if (value == null) { return null; }
    if (primitives.indexOf(typeof(value)) >= 0) { return value; }

    if (typeof(value) === "object") {
        // We internally marked this object as safe enough
        if (immutable in value && value[immutable] === valueImmutable) {
            return value;
        }

        // Promises are safe enough
        if ("then" in value && typeof(value.then) === "function") {
            return value;
        }

        // The result of the getAddress is what we are after
        if ("getAddress" in value && typeof(value.getAddress) === "function") {
            return new WrappedAddress(value.getAddress());
        }

        // Copy all the array elements
        if (Array.isArray(value)) {
            return value.map((v) => _deepCopy(v));
        }

        // Create a copy of the object
        const result: Record<string, any> = { };
        for (const key in result) {
            result[key] = value[key];
        }
    }

    throw new Error("failure to copy");
}

// Deep copy is used by overrides and situations where we need a copy
// of a generic object that won't change by normal usage. It is not
// generally useful outside the scope of this library.
export function deepCopy<T = any>(value: T): T {
    return _deepCopy(value);
}
*/
