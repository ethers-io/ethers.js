//import type { BigNumber, BigNumberish } from "./big-number";
//import type { Bytes, BytesLike } from "./bytes";
//import type { Signature, SignatureLike } from "./signature";
/*
export type Loose<T> = T extends BigNumber ? BigNumberish:
                       T extends number ? BigNumberish:
                       T extends Bytes ? BytesLike:
                       T extends Signature ? SignatureLike:
                       T;
export type LooseObject<T> = { [P in keyof T]?: Loose<T[P]>; };
*/

//export type Deferrable<T> = T | Promise<T>;
/*
export type DeferrableObject<T> = {
    [ P in keyof T ]: Deferrable<T[P]>
};
*/
/*
export type Frozen<T> = Readonly<{
    [ P in keyof T ]: T[P] extends Freezable<any> ? Frozen<T[P]>: T[P];
}>;

export interface Freezable<T> {
    clone(): T;
    freeze(): Frozen<T>;
    isFrozen(): boolean;
}
*/
/*
const _data: WeakMap<Data, Uint8Array> = new WeakMap();

export class Data implements Freezable<Data> {
    #props: {
        data: Uint8Array
    };

    [ index: number ]: number;

    constructor(lengthOrData: number | Uint8Array) {
        if (typeof(lengthOrData) === "number") {
            _data[this] = new Uint8Array(lengthOrData);
        } else {
            _data[this] = lengthOrData;
        }

        return new Proxy(this, {
            get: (target, prop, receiver) => {
                const index = parseInt(String(prop));
                if (String(index) !== prop) { return Reflect.get(target, prop, receiver); }

                const data = _data[this];
                if (index < 0 || index > data.length || index % 1) {
                    throw new Error("");
                }
                return data[index];
            },

            set: (target, prop, value, receiver) => {
                const index = parseInt(String(prop));
                if (String(index) !== prop) { return false; }

                if (value < 0 || value > 255 || value % 1) { return false; }

                const data = _data[this];
                if (index < 0 || index > data.length || index % 1) {
                    return false;
                }

                data[index] = value;

                return true;
            },
        });
    }

    toString(): string {
        return this.slice().toString();
    }

    slice(): Uint8Array {
        return _data.get(this).slice();
    }

    clone(): Data {
        return new Data(this.slice());
    }

    freeze(): Frozen<Data> {
        //Object.freeze(this.#props);
        return this;
    }

    isFrozen(): boolean {
        return Object.isFrozen(this.#props);
    }
}
const d = new Data(4);
console.log(d.toString());
d[0] = 45;
console.log(d.toString());
*/
/*
export type DeferrableObject<T> = {
    [ P in keyof T ]: Deferrable<T[P]>
};
*/

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
export function getStore<T, P extends keyof T>(store: T, key: P): T[P] {
    return store[key];
}

export function setStore<T, P extends keyof T>(store: T, key: P, value: T[P]): void {
    if (Object.isFrozen(store)) {
        throw new Error("frozen object is immuatable; cannot set " + key);
    }
    store[key] = value;
}
*/
export interface CancellablePromise<T> extends Promise<T> {
    cancel(): Promise<void>;
}
/*
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
