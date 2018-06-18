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

export function resolveProperties(object: any): Promise<any> {
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
