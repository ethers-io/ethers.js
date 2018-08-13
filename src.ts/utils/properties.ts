'use strict';

export function defineReadOnly(object: any, name: string, value: any): void {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
}

export function defineFrozen(object: any, name: string, value: any): void {
    var frozen = JSON.stringify(value);
    Object.defineProperty(object, name, {
        enumerable: true,
        get: function() { return JSON.parse(frozen); }
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

export function jsonCopy(object: any): any {
    return JSON.parse(JSON.stringify(object));
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

