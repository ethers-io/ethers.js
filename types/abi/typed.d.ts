/**
 *  A Typed object allows a value to have its type explicitly
 *  specified.
 *
 *  For example, in Solidity, the value ``45`` could represent a
 *  ``uint8`` or a ``uint256``. The value ``0x1234`` could represent
 *  a ``bytes2`` or ``bytes``.
 *
 *  Since JavaScript has no meaningful way to explicitly inform any
 *  APIs which what the type is, this allows transparent interoperation
 *  with Soldity.
 *
 *  @_subsection: api/abi:Typed Values
 */
import type { Addressable } from "../address/index.js";
import type { BigNumberish, BytesLike } from "../utils/index.js";
import type { Result } from "./coders/abstract-coder.js";
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
export declare class Typed {
    #private;
    readonly type: string;
    readonly value: any;
    readonly _typedSymbol: Symbol;
    constructor(gaurd: any, type: string, value: any, options?: any);
    format(): string;
    defaultValue(): string | number | bigint | Result;
    minValue(): string | number | bigint;
    maxValue(): string | number | bigint;
    isBigInt(): this is TypedBigInt;
    isData(): this is TypedData;
    isString(): this is TypedString;
    get tupleName(): null | string;
    get arrayLength(): null | number;
    static from(type: string, value: any): Typed;
    static uint8(v: BigNumberish): Typed;
    static uint16(v: BigNumberish): Typed;
    static uint24(v: BigNumberish): Typed;
    static uint32(v: BigNumberish): Typed;
    static uint40(v: BigNumberish): Typed;
    static uint48(v: BigNumberish): Typed;
    static uint56(v: BigNumberish): Typed;
    static uint64(v: BigNumberish): Typed;
    static uint72(v: BigNumberish): Typed;
    static uint80(v: BigNumberish): Typed;
    static uint88(v: BigNumberish): Typed;
    static uint96(v: BigNumberish): Typed;
    static uint104(v: BigNumberish): Typed;
    static uint112(v: BigNumberish): Typed;
    static uint120(v: BigNumberish): Typed;
    static uint128(v: BigNumberish): Typed;
    static uint136(v: BigNumberish): Typed;
    static uint144(v: BigNumberish): Typed;
    static uint152(v: BigNumberish): Typed;
    static uint160(v: BigNumberish): Typed;
    static uint168(v: BigNumberish): Typed;
    static uint176(v: BigNumberish): Typed;
    static uint184(v: BigNumberish): Typed;
    static uint192(v: BigNumberish): Typed;
    static uint200(v: BigNumberish): Typed;
    static uint208(v: BigNumberish): Typed;
    static uint216(v: BigNumberish): Typed;
    static uint224(v: BigNumberish): Typed;
    static uint232(v: BigNumberish): Typed;
    static uint240(v: BigNumberish): Typed;
    static uint248(v: BigNumberish): Typed;
    static uint256(v: BigNumberish): Typed;
    static uint(v: BigNumberish): Typed;
    static int8(v: BigNumberish): Typed;
    static int16(v: BigNumberish): Typed;
    static int24(v: BigNumberish): Typed;
    static int32(v: BigNumberish): Typed;
    static int40(v: BigNumberish): Typed;
    static int48(v: BigNumberish): Typed;
    static int56(v: BigNumberish): Typed;
    static int64(v: BigNumberish): Typed;
    static int72(v: BigNumberish): Typed;
    static int80(v: BigNumberish): Typed;
    static int88(v: BigNumberish): Typed;
    static int96(v: BigNumberish): Typed;
    static int104(v: BigNumberish): Typed;
    static int112(v: BigNumberish): Typed;
    static int120(v: BigNumberish): Typed;
    static int128(v: BigNumberish): Typed;
    static int136(v: BigNumberish): Typed;
    static int144(v: BigNumberish): Typed;
    static int152(v: BigNumberish): Typed;
    static int160(v: BigNumberish): Typed;
    static int168(v: BigNumberish): Typed;
    static int176(v: BigNumberish): Typed;
    static int184(v: BigNumberish): Typed;
    static int192(v: BigNumberish): Typed;
    static int200(v: BigNumberish): Typed;
    static int208(v: BigNumberish): Typed;
    static int216(v: BigNumberish): Typed;
    static int224(v: BigNumberish): Typed;
    static int232(v: BigNumberish): Typed;
    static int240(v: BigNumberish): Typed;
    static int248(v: BigNumberish): Typed;
    static int256(v: BigNumberish): Typed;
    static int(v: BigNumberish): Typed;
    static bytes1(v: BytesLike): Typed;
    static bytes2(v: BytesLike): Typed;
    static bytes3(v: BytesLike): Typed;
    static bytes4(v: BytesLike): Typed;
    static bytes5(v: BytesLike): Typed;
    static bytes6(v: BytesLike): Typed;
    static bytes7(v: BytesLike): Typed;
    static bytes8(v: BytesLike): Typed;
    static bytes9(v: BytesLike): Typed;
    static bytes10(v: BytesLike): Typed;
    static bytes11(v: BytesLike): Typed;
    static bytes12(v: BytesLike): Typed;
    static bytes13(v: BytesLike): Typed;
    static bytes14(v: BytesLike): Typed;
    static bytes15(v: BytesLike): Typed;
    static bytes16(v: BytesLike): Typed;
    static bytes17(v: BytesLike): Typed;
    static bytes18(v: BytesLike): Typed;
    static bytes19(v: BytesLike): Typed;
    static bytes20(v: BytesLike): Typed;
    static bytes21(v: BytesLike): Typed;
    static bytes22(v: BytesLike): Typed;
    static bytes23(v: BytesLike): Typed;
    static bytes24(v: BytesLike): Typed;
    static bytes25(v: BytesLike): Typed;
    static bytes26(v: BytesLike): Typed;
    static bytes27(v: BytesLike): Typed;
    static bytes28(v: BytesLike): Typed;
    static bytes29(v: BytesLike): Typed;
    static bytes30(v: BytesLike): Typed;
    static bytes31(v: BytesLike): Typed;
    static bytes32(v: BytesLike): Typed;
    static address(v: string | Addressable): Typed;
    static bool(v: any): Typed;
    static bytes(v: BytesLike): Typed;
    static string(v: string): Typed;
    static array(v: Array<any | Typed>, dynamic?: null | boolean): Typed;
    static tuple(v: Array<any | Typed> | Record<string, any | Typed>, name?: string): Typed;
    static overrides(v: Record<string, any>): Typed;
    /**
     *  Returns true only if %%value%% is a [[Typed]] instance.
     */
    static isTyped(value: any): value is Typed;
    /**
     *  If the value is a [[Typed]] instance, validates the underlying value
     *  and returns it, otherwise returns value directly.
     *
     *  This is useful for functions that with to accept either a [[Typed]]
     *  object or values.
     */
    static dereference<T>(value: Typed | T, type: string): T;
}
//# sourceMappingURL=typed.d.ts.map