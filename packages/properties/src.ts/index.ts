"use strict";

import * as errors from "@ethersproject/errors";

export function defineReadOnly(object: any, name: string, value: any): void {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
}

// Crawl up the constructor chain to find a static method
export function getStatic<T>(ctor: any, key: string): T {
    for (let i = 0; i < 32; i++) {
        if (ctor[key]) { return ctor[key]; }
        if (!ctor.prototype || typeof(ctor.prototype) !== "object") { break; }
        ctor = Object.getPrototypeOf(ctor.prototype).constructor;
    }
    return null;
}

export function resolveProperties(object: any): Promise<any> {
    let result: any = {};

    let promises: Array<Promise<void>> = [];
    Object.keys(object).forEach((key) => {
        let value = object[key];
        if (value instanceof Promise) {
            promises.push(
                value.then((value) => {
                    result[key] = value;
                    return null;
                })
            );
        } else {
            result[key] = value;
        }
    });

    return Promise.all(promises).then(() => {
        return result;
    });
}

export function checkProperties(object: any, properties: { [ name: string ]: boolean }): void {
    if (!object || typeof(object) !== "object") {
        errors.throwError("invalid object", errors.INVALID_ARGUMENT, {
            argument: "object",
            value: object
        });
    }

    Object.keys(object).forEach((key) => {
        if (!properties[key]) {
            errors.throwError("invalid object key - " + key, errors.INVALID_ARGUMENT, {
                argument: "transaction",
                value: object,
                key: key
            });
        }
    });
}

export function shallowCopy(object: any): any {
    let result: any = {};
    for (let key in object) { result[key] = object[key]; }
    return result;
}

let opaque: { [key: string]: boolean } = { bigint: true, boolean: true, number: true, string: true };

// Returns a new copy of object, such that no properties may be replaced.
// New properties may be added only to objects.
export function deepCopy(object: any): any {

    // Opaque objects are not mutable, so safe to copy by assignment
    if (object === undefined || object === null || opaque[typeof(object)]) { return object; }

    // Arrays are mutable, so we need to create a copy
    if (Array.isArray(object)) {
        return Object.freeze(object.map((item) => deepCopy(item)));
    }

    if (typeof(object) === "object") {

        // Immutable objects are safe to just use
        if (Object.isFrozen(object)) { return object; }

        let result: { [ key: string ]: any } = {};
        for (let key in object) {
            let value = object[key];
            if (value === undefined) { continue; }
            defineReadOnly(result, key, deepCopy(value));
        }

        return result;
    }

    // The function type is also immutable, so safe to copy by assignment
    if (typeof(object) === "function") {
        return object;
    }

    throw new Error("Cannot deepCopy " + typeof(object));
}

export class Description {
    constructor(info: any) {
        for (let key in info) {
            (<any>this)[key] = deepCopy(info[key]);
        }
        Object.freeze(this);
    }
}
