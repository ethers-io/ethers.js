'use strict';

export function defineReadOnly(object, name, value) {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
}

export function defineFrozen(object, name, value) {
    var frozen = JSON.stringify(value);
    Object.defineProperty(object, name, {
        enumerable: true,
        get: function() { return JSON.parse(frozen); }
    });
}

export type DeferredSetter = (value: any) => void;
export function defineDeferredReadOnly(object, name, value): DeferredSetter {
    var _value = value;
    var setter = function(value: any): void {
        _value = value;
    }

    Object.defineProperty(object, name, {
        enumerable: true,
        get: function(): any { return _value; },
        set: setter
    });

    return setter;
}

export function resolveProperties(object: any) {
    let result: any = {};

    let promises: Array<Promise<any>> = [];
    Object.keys(object).forEach((key) => {
        let value = object[key];
        if (value instanceof Promise) {
            promises.push(
                value.then((value) => { result[key] = value; })
            );
        } else {
            result[key] = value;
        }
    });

    return Promise.all(promises).then(() => {
        return object;
    });
}

export function shallowCopy(object: any): any {
    let result = {};
    for (var key in object) { result[key] = object[key]; }
    return result;
}

export function jsonCopy(object: any): any {
    return JSON.parse(JSON.stringify(object));
}
