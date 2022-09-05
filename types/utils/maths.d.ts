import type { BytesLike } from "./data.js";
export declare type Numeric = number | bigint;
export declare type BigNumberish = string | Numeric;
/**
 *  Convert %%value%% from a twos-compliment value of %%width%% bits.
 */
export declare function fromTwos(_value: BigNumberish, _width: Numeric): bigint;
/**
 *  Convert %%value%% to a twos-compliment value of %%width%% bits.
 */
export declare function toTwos(_value: BigNumberish, _width: Numeric): bigint;
/**
 *  Mask %%value%% with a bitmask of %%bits%% ones.
 */
export declare function mask(_value: BigNumberish, _bits: Numeric): bigint;
export declare function toBigInt(value: BigNumberish | Uint8Array): bigint;
export declare function toNumber(value: BigNumberish | Uint8Array): number;
/**
 *  Converts %%value%% to a Big Endian hexstring, optionally padded to
 *  %%width%% bytes.
 */
export declare function toHex(_value: BigNumberish, _width?: Numeric): string;
/**
 *  Converts %%value%% to a Big Endian Uint8Array.
 */
export declare function toArray(_value: BigNumberish): Uint8Array;
export declare function toQuantity(value: BytesLike | BigNumberish): string;
//# sourceMappingURL=maths.d.ts.map