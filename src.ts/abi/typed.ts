/**
 *  About typed...
 *
 *  @_subsection: api/abi:Typed Values
 */

import { assertPrivate, defineProperties } from "../utils/index.js";

import type { Addressable } from "../address/index.js";
import type { BigNumberish, BytesLike } from "../utils/index.js";

import type { Result } from "./coders/abstract-coder.js";

const _gaurd = { };

function n(value: BigNumberish, width: number): Typed {
    let signed = false;
    if (width < 0) {
        signed = true;
        width *= -1;
    }

    // @TODO: Check range is valid for value
    return new Typed(_gaurd, `${ signed ? "": "u" }int${ width }`, value, { signed, width });
}

function b(value: BytesLike, size?: number): Typed {
    // @TODO: Check range is valid for value
    return new Typed(_gaurd, `bytes${ (size) ? size: "" }`, value, { size });
}

export interface TypedNumber extends Typed {
    value: number;
    defaultValue(): number;
    minValue(): number;
    maxValue(): number;
}

export interface TypedBigInt extends Typed {
    value: bigint;
    defaultValue(): bigint;
    minValue(): bigint;
    maxValue(): bigint;
}

export interface TypedData extends Typed {
    value: string;
    defaultValue(): string;
}

export interface TypedString extends Typed {
    value: string;
    defaultValue(): string;
}

const _typedSymbol = Symbol.for("_ethers_typed");

export class Typed {
    readonly type!: string;
    readonly value!: any;

    readonly #options: any;

    readonly _typedSymbol!: Symbol;

    constructor(gaurd: any, type: string, value: any, options?: any) {
        if (options == null) { options = null; }
        assertPrivate(_gaurd, gaurd, "Typed");
        defineProperties<Typed>(this, { _typedSymbol, type, value });
        this.#options = options;

        // Check the value is valid
        this.format();
    }

    format(): string {
        if (this.type === "array") {
            throw new Error("");
        } else if (this.type === "dynamicArray") {
            throw new Error("");
        } else if (this.type === "tuple") {
            return `tuple(${ this.value.map((v: Typed) => v.format()).join(",") })`
        }

        return this.type;
    }

    defaultValue(): string | number | bigint | Result {
        return 0;
    }

    minValue(): string | number | bigint {
        return 0;
    }

    maxValue(): string | number | bigint {
        return 0;
    }

    isBigInt(): this is TypedBigInt {
        return !!(this.type.match(/^u?int[0-9]+$/));
    }

    isData(): this is TypedData {
        return this.type.startsWith("bytes");
    }

    isString(): this is TypedString {
        return (this.type === "string");
    }

    get tupleName(): null | string {
        if (this.type !== "tuple") { throw TypeError("not a tuple"); }
        return this.#options;
    }

    // Returns the length of this type as an array
    // - `null` indicates the length is unforced, it could be dynamic
    // - `-1` indicates the length is dynamic
    // - any other value indicates it is a static array and is its length
    get arrayLength(): null | number {
        if (this.type !== "array") { throw TypeError("not an array"); }
        if (this.#options === true) { return -1; }
        if (this.#options === false) { return (<Array<any>>(this.value)).length; }
        return null;
    }

    static from(type: string, value: any): Typed {
        return new Typed(_gaurd, type, value);
    }

    static uint8(v: BigNumberish): Typed { return n(v, 8); }
    static uint16(v: BigNumberish): Typed { return n(v, 16); }
    static uint24(v: BigNumberish): Typed { return n(v, 24); }
    static uint32(v: BigNumberish): Typed { return n(v, 32); }
    static uint40(v: BigNumberish): Typed { return n(v, 40); }
    static uint48(v: BigNumberish): Typed { return n(v, 48); }
    static uint56(v: BigNumberish): Typed { return n(v, 56); }
    static uint64(v: BigNumberish): Typed { return n(v, 64); }
    static uint72(v: BigNumberish): Typed { return n(v, 72); }
    static uint80(v: BigNumberish): Typed { return n(v, 80); }
    static uint88(v: BigNumberish): Typed { return n(v, 88); }
    static uint96(v: BigNumberish): Typed { return n(v, 96); }
    static uint104(v: BigNumberish): Typed { return n(v, 104); }
    static uint112(v: BigNumberish): Typed { return n(v, 112); }
    static uint120(v: BigNumberish): Typed { return n(v, 120); }
    static uint128(v: BigNumberish): Typed { return n(v, 128); }
    static uint136(v: BigNumberish): Typed { return n(v, 136); }
    static uint144(v: BigNumberish): Typed { return n(v, 144); }
    static uint152(v: BigNumberish): Typed { return n(v, 152); }
    static uint160(v: BigNumberish): Typed { return n(v, 160); }
    static uint168(v: BigNumberish): Typed { return n(v, 168); }
    static uint176(v: BigNumberish): Typed { return n(v, 176); }
    static uint184(v: BigNumberish): Typed { return n(v, 184); }
    static uint192(v: BigNumberish): Typed { return n(v, 192); }
    static uint200(v: BigNumberish): Typed { return n(v, 200); }
    static uint208(v: BigNumberish): Typed { return n(v, 208); }
    static uint216(v: BigNumberish): Typed { return n(v, 216); }
    static uint224(v: BigNumberish): Typed { return n(v, 224); }
    static uint232(v: BigNumberish): Typed { return n(v, 232); }
    static uint240(v: BigNumberish): Typed { return n(v, 240); }
    static uint248(v: BigNumberish): Typed { return n(v, 248); }
    static uint256(v: BigNumberish): Typed { return n(v, 256); }
    static uint(v: BigNumberish): Typed { return n(v, 256); }

    static int8(v: BigNumberish): Typed { return n(v, -8); }
    static int16(v: BigNumberish): Typed { return n(v, -16); }
    static int24(v: BigNumberish): Typed { return n(v, -24); }
    static int32(v: BigNumberish): Typed { return n(v, -32); }
    static int40(v: BigNumberish): Typed { return n(v, -40); }
    static int48(v: BigNumberish): Typed { return n(v, -48); }
    static int56(v: BigNumberish): Typed { return n(v, -56); }
    static int64(v: BigNumberish): Typed { return n(v, -64); }
    static int72(v: BigNumberish): Typed { return n(v, -72); }
    static int80(v: BigNumberish): Typed { return n(v, -80); }
    static int88(v: BigNumberish): Typed { return n(v, -88); }
    static int96(v: BigNumberish): Typed { return n(v, -96); }
    static int104(v: BigNumberish): Typed { return n(v, -104); }
    static int112(v: BigNumberish): Typed { return n(v, -112); }
    static int120(v: BigNumberish): Typed { return n(v, -120); }
    static int128(v: BigNumberish): Typed { return n(v, -128); }
    static int136(v: BigNumberish): Typed { return n(v, -136); }
    static int144(v: BigNumberish): Typed { return n(v, -144); }
    static int152(v: BigNumberish): Typed { return n(v, -152); }
    static int160(v: BigNumberish): Typed { return n(v, -160); }
    static int168(v: BigNumberish): Typed { return n(v, -168); }
    static int176(v: BigNumberish): Typed { return n(v, -176); }
    static int184(v: BigNumberish): Typed { return n(v, -184); }
    static int192(v: BigNumberish): Typed { return n(v, -192); }
    static int200(v: BigNumberish): Typed { return n(v, -200); }
    static int208(v: BigNumberish): Typed { return n(v, -208); }
    static int216(v: BigNumberish): Typed { return n(v, -216); }
    static int224(v: BigNumberish): Typed { return n(v, -224); }
    static int232(v: BigNumberish): Typed { return n(v, -232); }
    static int240(v: BigNumberish): Typed { return n(v, -240); }
    static int248(v: BigNumberish): Typed { return n(v, -248); }
    static int256(v: BigNumberish): Typed { return n(v, -256); }
    static int(v: BigNumberish): Typed { return n(v, -256); }

    static bytes1(v: BytesLike): Typed { return b(v, 1); }
    static bytes2(v: BytesLike): Typed { return b(v, 2); }
    static bytes3(v: BytesLike): Typed { return b(v, 3); }
    static bytes4(v: BytesLike): Typed { return b(v, 4); }
    static bytes5(v: BytesLike): Typed { return b(v, 5); }
    static bytes6(v: BytesLike): Typed { return b(v, 6); }
    static bytes7(v: BytesLike): Typed { return b(v, 7); }
    static bytes8(v: BytesLike): Typed { return b(v, 8); }
    static bytes9(v: BytesLike): Typed { return b(v, 9); }
    static bytes10(v: BytesLike): Typed { return b(v, 10); }
    static bytes11(v: BytesLike): Typed { return b(v, 11); }
    static bytes12(v: BytesLike): Typed { return b(v, 12); }
    static bytes13(v: BytesLike): Typed { return b(v, 13); }
    static bytes14(v: BytesLike): Typed { return b(v, 14); }
    static bytes15(v: BytesLike): Typed { return b(v, 15); }
    static bytes16(v: BytesLike): Typed { return b(v, 16); }
    static bytes17(v: BytesLike): Typed { return b(v, 17); }
    static bytes18(v: BytesLike): Typed { return b(v, 18); }
    static bytes19(v: BytesLike): Typed { return b(v, 19); }
    static bytes20(v: BytesLike): Typed { return b(v, 20); }
    static bytes21(v: BytesLike): Typed { return b(v, 21); }
    static bytes22(v: BytesLike): Typed { return b(v, 22); }
    static bytes23(v: BytesLike): Typed { return b(v, 23); }
    static bytes24(v: BytesLike): Typed { return b(v, 24); }
    static bytes25(v: BytesLike): Typed { return b(v, 25); }
    static bytes26(v: BytesLike): Typed { return b(v, 26); }
    static bytes27(v: BytesLike): Typed { return b(v, 27); }
    static bytes28(v: BytesLike): Typed { return b(v, 28); }
    static bytes29(v: BytesLike): Typed { return b(v, 29); }
    static bytes30(v: BytesLike): Typed { return b(v, 30); }
    static bytes31(v: BytesLike): Typed { return b(v, 31); }
    static bytes32(v: BytesLike): Typed { return b(v, 32); }

    static address(v: string | Addressable): Typed { return new Typed(_gaurd, "address", v); }
    static bool(v: any): Typed { return new Typed(_gaurd, "bool", !!v); }
    static bytes(v: BytesLike): Typed { return new Typed(_gaurd, "bytes", v); }
    static string(v: string): Typed { return new Typed(_gaurd, "string", v); }

    static array(v: Array<any | Typed>, dynamic?: null | boolean): Typed {
        throw new Error("not implemented yet");
        return new Typed(_gaurd, "array", v, dynamic);
    }

    static tuple(v: Array<any | Typed> | Record<string, any | Typed>, name?: string): Typed {
        throw new Error("not implemented yet");
        return new Typed(_gaurd, "tuple", v, name);
    }

    static overrides(v: Record<string, any>): Typed {
        return new Typed(_gaurd, "overrides", Object.assign({ }, v));
    }

    /**
     *  Returns true only if %%value%% is a [[Typed]] instance.
     */
    static isTyped(value: any): value is Typed {
        return (value && value._typedSymbol === _typedSymbol);
    }

    /**
     *  If the value is a [[Typed]] instance, validates the underlying value
     *  and returns it, otherwise returns value directly.
     *
     *  This is useful for functions that with to accept either a [[Typed]]
     *  object or values.
     */
    static dereference<T>(value: Typed | T, type: string): T {
        if (Typed.isTyped(value)) {
            if (value.type !== type) {
                throw new Error(`invalid type: expecetd ${ type }, got ${ value.type }`);
            }
            return value.value;
        }
        return value;
    }
}
