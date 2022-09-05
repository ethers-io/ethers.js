export async function resolveProperties(value) {
    const keys = Object.keys(value);
    const results = await Promise.all(keys.map((k) => Promise.resolve(value[k])));
    return results.reduce((accum, v, index) => {
        accum[keys[index]] = v;
        return accum;
    }, {});
}
export function defineReadOnly(object, name, value) {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
}
/*
export interface CancellablePromise<T> extends Promise<T> {
    cancel(): Promise<void>;
}
export type IsCancelled = () => Promise<boolean>;

export function createPromise<T>(resolve: (isCancelled: IsCancelled, (result: T) => void) => void, reject: (error: Error) => void, isCancelled: IsCancelled): CancellablePromise<T> {
    let cancelled = false;

    const promise = new Promise((resolve, reject) => {

    });

    (<CancellablePromise<T>>promise).cancel = function() {
        cancelled = true;
    };

    return (<CancellablePromise<T>>promise);
}
*/
/*
export class A implements Freezable<A> {
    foo: number;
    constructor(foo: number) {
        this.foo = foo;
    }
    freeze(): Frozen<A> {
        Object.freeze(this);
        return this;
    }
    clone(): A {
        return new A(this.foo);
    }
}

export class B implements Freezable<B> {
    a: A;
    constructor(a: A) {
        this.a = a;
    }
    freeze(): Frozen<B> {
        this.a.freeze();
        Object.freeze(this);
        return this;
    }
    clone(): B {
        return new B(this.a);
    }
}

export function test() {
    const a = new A(123);
    const b = new B(a);
    b.a = new A(234);
    const b2 = b.freeze();
    b2.a.foo = 123; // = a;
}
*/
function checkType(value, type) {
    const types = type.split("|").map(t => t.trim());
    for (let i = 0; i < types.length; i++) {
        switch (type) {
            case "any":
                return;
            case "boolean":
            case "number":
            case "string":
                if (typeof (value) === type) {
                    return;
                }
        }
    }
    throw new Error("invalid value for type");
}
export function defineProperties(target, values, types, defaults) {
    for (let key in values) {
        let value = values[key];
        const fallback = (defaults ? defaults[key] : undefined);
        if (fallback !== undefined) {
            value = fallback;
        }
        else {
            const type = (types ? types[key] : null);
            if (type) {
                checkType(value, type);
            }
        }
        Object.defineProperty(target, key, { enumerable: true, value, writable: false });
    }
}
//# sourceMappingURL=properties.js.map