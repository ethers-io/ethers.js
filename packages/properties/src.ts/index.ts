"use strict";

import * as errors from "@ethersproject/errors";

export function defineReadOnly(object: any, name: string, value: any): void {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
}

// There are some issues with instanceof with npm link, so we use this
// to ensure types are what we expect. We use this for a little extra
// protection to make sure the correct types are being passed around.

function getType(object: any) {

    let type = typeof(object);
    if (type !== "function") { return null; }

    let types = [ ];
    let obj = object;
    while (true) {
        let type = obj.name;
        if (!type) { break; }
        types.push(type);
        obj = Object.getPrototypeOf(obj);
    }
    return types.join(" ");
}

function hasSuffix(text: string, suffix: string) {
    return text.substring(text.length - suffix.length) === suffix;
}

export function isNamedInstance<T>(type: Function | string, value: any): value is T {
    let name = getType(type);
    if (!name) { return false; }

    // Not a string...
    if (typeof(value) !== "string") {

        // Not an instance...
        if (typeof(value) !== "object") { return false; }

        // Get the instance type
        value = getType(value.constructor);
    }

    return (name === value || hasSuffix(value, " " + name));
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

let opaque: { [key: string]: boolean } = { boolean: true, number: true, string: true };

export function deepCopy(object: any, frozen?: boolean): any {

    // Opaque objects are not mutable, so safe to copy by assignment
    if (object === undefined || object === null || opaque[typeof(object)]) { return object; }

    // Arrays are mutable, so we need to create a copy
    if (Array.isArray(object)) {
        let result = object.map((item) => deepCopy(item, frozen));
        if (frozen) { Object.freeze(result); }
        return result
    }

    if (typeof(object) === "object") {

        // Some internal objects, which are already immutable
        if (isNamedInstance("BigNumber", object)) { return object; }
        if (isNamedInstance("Description", object)) { return object; }
        if (isNamedInstance("Indexed", object)) { return object; }

        let result: { [ key: string ]: any } = {};
        for (let key in object) {
            let value = object[key];
            if (value === undefined) { continue; }
            defineReadOnly(result, key, deepCopy(value, frozen));
        }

        if (frozen) { Object.freeze(result); }

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
            defineReadOnly(this, key, deepCopy(info[key], true));
        }
        Object.freeze(this);
    }

    static isType(value: any): boolean {
        return isNamedInstance(this, value);
    }
}
