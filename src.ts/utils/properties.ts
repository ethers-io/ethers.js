'use strict';

export function defineReadOnly(object: any, name: string, value: any): void {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
}

// There are some issues with instanceof with npm link, so we use this
// to ensure types are what we expect.

export function setType(object: any, type: string): void {
    Object.defineProperty(object, '_ethersType', { configurable: false, value: type, writable: false });
}

export function isType(object: any, type: string): boolean {
    return (object && object._ethersType === type);
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

export function shallowCopy(object: any): any {
    let result: any = {};
    for (var key in object) { result[key] = object[key]; }
    return result;
}

let opaque: { [key: string]: boolean } = { boolean: true, number: true, string: true };

export function deepCopy(object: any, frozen?: boolean): any {

    if (object === undefined || object === null || opaque[typeof(object)]) { return object; }

    if (Array.isArray(object)) {
        let result: Array<any> = [];
        object.forEach((item) => {
            result.push(deepCopy(item, frozen));
        });

        if (frozen) { Object.freeze(result); }

        return result
    }

    if (typeof(object) === 'object') {

        // Some internal objects, which are already immutable
        if (isType(object, 'BigNumber')) { return object; }
        if (isType(object, 'Description')) { return object; }
        if (isType(object, 'Indexed')) { return object; }

        let result: { [ key: string ]: any } = {};
        for (var key in object) {
            let value = object[key];
            if (value === undefined) { continue; }
            defineReadOnly(result, key, deepCopy(value, frozen));
        }

        if (frozen) { Object.freeze(result); }

        return result;
    }

    throw new Error('Cannot deepCopy ' + typeof(object));
}

// See: https://github.com/isaacs/inherits/blob/master/inherits_browser.js
function inherits(ctor: any, superCtor: any): void {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
}

export function inheritable(parent: any): (child: any) => void {
    return function(child: any): void {
        inherits(child, parent);
        defineReadOnly(child, 'inherits', inheritable(child));
    }
}

