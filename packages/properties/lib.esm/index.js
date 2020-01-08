"use strict";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
export function defineReadOnly(object, name, value) {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
}
// Crawl up the constructor chain to find a static method
export function getStatic(ctor, key) {
    for (let i = 0; i < 32; i++) {
        if (ctor[key]) {
            return ctor[key];
        }
        if (!ctor.prototype || typeof (ctor.prototype) !== "object") {
            break;
        }
        ctor = Object.getPrototypeOf(ctor.prototype).constructor;
    }
    return null;
}
export function resolveProperties(object) {
    const promises = Object.keys(object).map((key) => {
        const value = object[key];
        if (!(value instanceof Promise)) {
            return Promise.resolve({ key: key, value: value });
        }
        return value.then((value) => {
            return { key: key, value: value };
        });
    });
    return Promise.all(promises).then((results) => {
        const result = {};
        return results.reduce((accum, result) => {
            accum[result.key] = result.value;
            return accum;
        }, result);
    });
}
export function checkProperties(object, properties) {
    if (!object || typeof (object) !== "object") {
        logger.throwArgumentError("invalid object", "object", object);
    }
    Object.keys(object).forEach((key) => {
        if (!properties[key]) {
            logger.throwArgumentError("invalid object key - " + key, "transaction:" + key, object);
        }
    });
}
export function shallowCopy(object) {
    const result = {};
    for (const key in object) {
        result[key] = object[key];
    }
    return result;
}
const opaque = { bigint: true, boolean: true, number: true, string: true };
// Returns a new copy of object, such that no properties may be replaced.
// New properties may be added only to objects.
export function deepCopy(object) {
    // Opaque objects are not mutable, so safe to copy by assignment
    if (object === undefined || object === null || opaque[typeof (object)]) {
        return object;
    }
    // Arrays are mutable, so we need to create a copy
    if (Array.isArray(object)) {
        return Object.freeze(object.map((item) => deepCopy(item)));
    }
    if (typeof (object) === "object") {
        // Immutable objects are safe to just use
        if (Object.isFrozen(object)) {
            return object;
        }
        const result = {};
        for (const key in object) {
            const value = object[key];
            if (value === undefined) {
                continue;
            }
            defineReadOnly(result, key, deepCopy(value));
        }
        return result;
    }
    // The function type is also immutable, so safe to copy by assignment
    if (typeof (object) === "function") {
        return object;
    }
    throw new Error("Cannot deepCopy " + typeof (object));
}
export class Description {
    constructor(info) {
        for (const key in info) {
            this[key] = deepCopy(info[key]);
        }
    }
}
