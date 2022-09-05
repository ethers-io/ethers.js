export async function resolveProperties<T>(value: { [ P in keyof T ]: T[P] | Promise<T[P]>}): Promise<T> {
    const keys = Object.keys(value);
    const results = await Promise.all(keys.map((k) => Promise.resolve(value[<keyof T>k])));
    return results.reduce((accum: any, v, index) => {
        accum[keys[index]] = v;
        return accum;
    }, <{ [ P in keyof T]: T[P] }>{ });
}

export function defineReadOnly<T, P extends keyof T>(object: T, name: P, value: T[P]): void {
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

function checkType(value: any, type: string): void {
    const types = type.split("|").map(t => t.trim());
    for (let i = 0; i < types.length; i++) {
        switch (type) {
            case "any":
                return;
            case "boolean":
            case "number":
            case "string":
                if (typeof(value) === type) { return; }
        }
    }
    throw new Error("invalid value for type");
}

export function defineProperties<T>(
 target: T,
 values: { [ K in keyof T ]?: undefined | T[K] },
 types?: { [ K in keyof T ]?: string },
 defaults?: { [ K in keyof T ]?: T[K] }): void {

    for (let key in values) {
        let value = values[key];

        const fallback = (defaults ? defaults[key]: undefined);
        if (fallback !== undefined) {
            value = fallback;
        } else {
            const type = (types ? types[key]: null);
            if (type) { checkType(value, type); }
        }
        Object.defineProperty(target, key, { enumerable: true, value, writable: false });
    }
}
