
import { toArray, toBigInt, toNumber } from "@ethersproject/math";
import { arrayify, concat, hexlify } from "@ethersproject/bytes";
import { defineProperties } from "@ethersproject/properties";

import { logger } from "../logger.js";

import type { BytesLike } from "@ethersproject/bytes";
import type { BigNumberish } from "@ethersproject/logger";

export const WordSize = 32;
const Padding = new Uint8Array(WordSize);

// Properties used to immediate pass through to the underlying object
// - `then` is used to detect if an object is a Promise for await
const passProperties = [ "then" ];

const _guard = { };

export class Result extends Array<any> {
    #indices: Map<string, Array<number>>;

    [ K: string | number ]: any

    constructor(guard: any, items: Array<any>, keys?: Array<null | string>) {
        logger.assertPrivate(guard, _guard, "Result");
        super(...items);

        // Name lookup table
        this.#indices = new Map();

        if (keys) {
            keys.forEach((key, index) => {
                if (key == null) { return; }
                if (this.#indices.has(key)) {
                    (<Array<number>>(this.#indices.get(key))).push(index);
                } else {
                    this.#indices.set(key, [ index ]);
                }
            });
        }
        Object.freeze(this);

        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (typeof(prop) === "string") {
                    if (prop.match(/^[0-9]+$/)) {
                        const index = logger.getNumber(prop, "%index");
                        if (index < 0 || index >= this.length) {
                            throw new RangeError("out of result range");
                        }

                        const item = target[index];
                        if (item instanceof Error) {
                            this.#throwError(`index ${ index }`, item);
                        }
                        return item;
                    }

                    // Pass important checks (like `then` for Promise) through
                    if (prop in target || passProperties.indexOf(prop) >= 0) {
                        return Reflect.get(target, prop, receiver);
                    }

                    // Something that could be a result keyword value
                    if (!(prop in target)) {
                        return target.getValue(prop);
                    }
                }

                return Reflect.get(target, prop, receiver);
            }
        });
    }

    slice(start?: number | undefined, end?: number | undefined): Array<any> {
        if (start == null) { start = 0; }
        if (end == null) { end = this.length; }

        const result = [ ];
        for (let i = start; i < end; i++) {
            let value: any;
            try {
                value = this[i];
            } catch (error: any) {
                value = error.error;
            }
            result.push(value);
        }
        return result;
    }

    #throwError(name: string, error: Error): never {
        const wrapped = new Error(`deferred error during ABI decoding triggered accessing ${ name }`);
        (<any>wrapped).error = error;
        throw wrapped;
    }

    getValue(name: string): any {
        const index = this.#indices.get(name);
        if (index != null && index.length === 1) {
            const item = this[index[0]];
            if (item instanceof Error) {
                this.#throwError(`property ${ JSON.stringify(name) }`, item);
            }
            return item;
        }

        throw new Error(`no named parameter: ${ JSON.stringify(name) }`);
    }

    static fromItems(items: Array<any>, keys?: Array<null | string>) {
        return new Result(_guard, items, keys);
    }
}

export function checkResultErrors(result: Result): Array<{ path: Array<string | number>, error: Error }> {
    // Find the first error (if any)
    const errors: Array<{ path: Array<string | number>, error: Error }> = [ ];

    const checkErrors = function(path: Array<string | number>, object: any): void {
        if (!Array.isArray(object)) { return; }
        for (let key in object) {
            const childPath = path.slice();
            childPath.push(key);

            try {
                 checkErrors(childPath, object[key]);
            } catch (error: any) {
                errors.push({ path: childPath, error: error });
            }
        }
    }
    checkErrors([ ], result);

    return errors;

}

function getValue(value: BigNumberish): Uint8Array {
    let bytes = toArray(value);

    if (bytes.length > WordSize) {
        logger.throwError("value out-of-bounds", "BUFFER_OVERRUN", {
            buffer: bytes,
            length: WordSize,
            offset: bytes.length
        });
    }

    if (bytes.length % WordSize) {
        bytes = arrayify(concat([ Padding.slice(bytes.length % WordSize), bytes ]));
    }

    return bytes;
}


export type CoerceFunc = (type: string, value: any) => any;

export abstract class Coder {

    // The coder name:
    //   - address, uint256, tuple, array, etc.
    readonly name!: string;

    // The fully expanded type, including composite types:
    //   - address, uint256, tuple(address,bytes), uint256[3][4][],  etc.
    readonly type!: string;

    // The localName bound in the signature, in this example it is "baz":
    //   - tuple(address foo, uint bar) baz
    readonly localName!: string;

    // Whether this type is dynamic:
    //  - Dynamic: bytes, string, address[], tuple(boolean[]), etc.
    //  - Not Dynamic: address, uint256, boolean[3], tuple(address, uint8)
    readonly dynamic!: boolean;

    constructor(name: string, type: string, localName: string, dynamic: boolean) {
        defineProperties<Coder>(this, { name, type, localName, dynamic }, {
            name: "string", type: "string", localName: "string", dynamic: "boolean"
        });
    }

    _throwError(message: string, value: any): never {
        return logger.throwArgumentError(message, this.localName, value);
    }

    abstract encode(writer: Writer, value: any): number;
    abstract decode(reader: Reader): any;

    abstract defaultValue(): any;
}

export class Writer {
    // An array of WordSize lengthed objects to concatenation
    #data: Array<Uint8Array>;
    #dataLength: number;

    constructor() {
        this.#data = [ ];
        this.#dataLength = 0;
    }

    get data(): string {
        return concat(this.#data);
    }
    get length(): number { return this.#dataLength; }

    #writeData(data: Uint8Array): number {
        this.#data.push(data);
        this.#dataLength += data.length;
        return data.length;
    }

    appendWriter(writer: Writer): number {
        return this.#writeData(arrayify(writer.data));
    }

    // Arrayish item; pad on the right to *nearest* WordSize
    writeBytes(value: BytesLike): number {
        let bytes = arrayify(value);
        const paddingOffset = bytes.length % WordSize;
        if (paddingOffset) {
            bytes = arrayify(concat([ bytes, Padding.slice(paddingOffset) ]))
        }
        return this.#writeData(bytes);
    }

    // Numeric item; pad on the left *to* WordSize
    writeValue(value: BigNumberish): number {
        return this.#writeData(getValue(value));
    }

    // Inserts a numeric place-holder, returning a callback that can
    // be used to asjust the value later
    writeUpdatableValue(): (value: BigNumberish) => void {
        const offset = this.#data.length;
        this.#data.push(Padding);
        this.#dataLength += WordSize;
        return (value: BigNumberish) => {
            this.#data[offset] = getValue(value);
        };
    }
}

export class Reader {
    // Allows incomplete unpadded data to be read; otherwise an error
    // is raised if attempting to overrun the buffer. This is required
    // to deal with an old Solidity bug, in which event data for
    // external (not public thoguh) was tightly packed.
    readonly allowLoose!: boolean;

    readonly #data: Uint8Array;
    #offset: number;

    readonly #coerceFunc: CoerceFunc;

    constructor(data: BytesLike, coerceFunc?: null | CoerceFunc, allowLoose?: boolean) {
        defineProperties<Reader>(this, { allowLoose: !!allowLoose });

        this.#data = arrayify(data);
        this.#coerceFunc = coerceFunc || Reader.coerce;

        this.#offset = 0;
    }

    get data(): string { return hexlify(this.#data); }
    get dataLength(): number { return this.#data.length; }
    get consumed(): number { return this.#offset; }
    get bytes(): Uint8Array { return new Uint8Array(this.#data); }

    // The default Coerce function
    static coerce(type: string, value: any): any {
        let match = type.match("^u?int([0-9]+)$");
        if (match && parseInt(match[1]) <= 48) { value =  value.toNumber(); }
        return value;
    }

    coerce(type: string, value: any): any {
        return this.#coerceFunc(type, value);
    }

    #peekBytes(offset: number, length: number, loose?: boolean): Uint8Array {
        let alignedLength = Math.ceil(length / WordSize) * WordSize;
        if (this.#offset + alignedLength > this.#data.length) {
            if (this.allowLoose && loose && this.#offset + length <= this.#data.length) {
                alignedLength = length;
            } else {
                logger.throwError("data out-of-bounds", "BUFFER_OVERRUN", {
                    buffer: arrayify(this.#data),
                    length: this.#data.length,
                    offset: this.#offset + alignedLength
                });
            }
        }
        return this.#data.slice(this.#offset, this.#offset + alignedLength)
    }

    // Create a sub-reader with the same underlying data, but offset
    subReader(offset: number): Reader {
        return new Reader(this.#data.slice(this.#offset + offset), this.#coerceFunc, this.allowLoose);
    }

    // Read bytes
    readBytes(length: number, loose?: boolean): Uint8Array {
        let bytes = this.#peekBytes(0, length, !!loose);
        this.#offset += bytes.length;
        // @TODO: Make sure the length..end bytes are all 0?
        return bytes.slice(0, length);
    }

    // Read a numeric values
    readValue(): bigint {
        return toBigInt(this.readBytes(WordSize));
    }

    readIndex(): number {
        return toNumber(this.readBytes(WordSize));
    }
}
