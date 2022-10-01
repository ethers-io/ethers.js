import { hexlify, isBytesLike } from "./data.js";
import { throwArgumentError } from "./errors.js";

import type { BytesLike } from "./data.js";

/**
 *  Any type that can be used where a numeric value is needed.
 */
export type Numeric = number | bigint;

/**
 *  Any type that can be used where a big number is needed.
 */
export type BigNumberish = string | Numeric;


const BN_0 = BigInt(0);
const BN_1 = BigInt(1);

// IEEE 754 support 53-bits of mantissa
const maxValue = 0x1fffffffffffff;

/**
 *  Convert %%value%% from a twos-compliment value of %%width%% bits.
 */
export function fromTwos(_value: BigNumberish, _width: Numeric): bigint {
    const value = getBigInt(_value, "value");
    const width = BigInt(getNumber(_width, "width"));

    // Top bit set; treat as a negative value
    if (value >> (width - BN_1)) {
        const mask = (BN_1 << width) - BN_1;
        return -(((~value) & mask) + BN_1);
    }

    return value;
}

/**
 *  Convert %%value%% to a twos-compliment value of %%width%% bits.
 */
export function toTwos(_value: BigNumberish, _width: Numeric): bigint {
    const value = getBigInt(_value, "value");
    const width = BigInt(getNumber(_width, "width"));

    if (value < BN_0) {
        const mask = (BN_1 << width) - BN_1;
        return ((~(-value)) & mask) + BN_1;
    }

    return value;
}

/**
 *  Mask %%value%% with a bitmask of %%bits%% ones.
 */
export function mask(_value: BigNumberish, _bits: Numeric): bigint {
    const value = getBigInt(_value, "value");
    const bits = BigInt(getNumber(_bits, "bits"));
    return value & ((BN_1 << bits) - BN_1);
}

/**
 *  Gets a [[BigInt]] from %%value%%. If it is an invalid value for
 *  a BigInt, then an ArgumentError will be thrown for %%name%%.
 */
export function getBigInt(value: BigNumberish, name?: string): bigint {
    switch (typeof(value)) {
        case "bigint": return value;
        case "number":
            if (!Number.isInteger(value)) {
                throwArgumentError("underflow", name || "value", value);
            } else if (value < -maxValue || value > maxValue) {
                throwArgumentError("overflow", name || "value", value);
            }
            return BigInt(value);
        case "string":
            try {
                if (value[0] === "-" && value[1] !== "-") {
                    return -BigInt(value.substring(1));
                }
                return BigInt(value);
            } catch(e: any) {
                throwArgumentError(`invalid BigNumberish string: ${ e.message }`, name || "value", value);
            }
    }
    return throwArgumentError("invalid BigNumberish value", name || "value", value);
}


const Nibbles = "0123456789abcdef";

/*
 * Converts %%value%% to a BigInt. If %%value%% is a Uint8Array, it
 * is treated as Big Endian data.
 */
export function toBigInt(value: BigNumberish | Uint8Array): bigint {
    if (value instanceof Uint8Array) {
        let result = "0x0";
        for (const v of value) {
            result += Nibbles[v >> 4];
            result += Nibbles[v & 0x0f];
        }
        return BigInt(result);
    }

    return getBigInt(value);
}

/**
 *  Gets a //number// from %%value%%. If it is an invalid value for
 *  a //number//, then an ArgumentError will be thrown for %%name%%.
 */
export function getNumber(value: BigNumberish, name?: string): number {
    switch (typeof(value)) {
        case "bigint":
            if (value < -maxValue || value > maxValue) {
                throwArgumentError("overflow", name || "value", value);
            }
            return Number(value);
        case "number":
            if (!Number.isInteger(value)) {
                throwArgumentError("underflow", name || "value", value);
            } else if (value < -maxValue || value > maxValue) {
                throwArgumentError("overflow", name || "value", value);
            }
            return value;
        case "string":
            try {
                return getNumber(BigInt(value), name);
            } catch(e: any) {
                throwArgumentError(`invalid numeric string: ${ e.message }`, name || "value", value);
            }
    }
    return throwArgumentError("invalid numeric value", name || "value", value);
}


/*
 * Converts %%value%% to a number. If %%value%% is a Uint8Array, it
 * is treated as Big Endian data. Throws if the value is not safe.
 */
export function toNumber(value: BigNumberish | Uint8Array): number {
    return getNumber(toBigInt(value));
}

/**
 *  Converts %%value%% to a Big Endian hexstring, optionally padded to
 *  %%width%% bytes.
 */
export function toHex(_value: BigNumberish, _width?: Numeric): string {
    const value = getBigInt(_value, "value");
    if (value < 0) { throw new Error("cannot convert negative value to hex"); }

    let result = value.toString(16);

    if (_width == null) {
        // Ensure the value is of even length
        if (result.length % 2) { result = "0" + result; }
    } else {
        const width = getNumber(_width, "width");
        if (width * 2 < result.length) { throw new Error(`value ${ value } exceeds width ${ width }`); }

        // Pad the value to the required width
        while (result.length < (width * 2)) { result = "0" + result; }

    }

    return "0x" + result;
}

/**
 *  Converts %%value%% to a Big Endian Uint8Array.
 */
export function toArray(_value: BigNumberish): Uint8Array {
    const value = getBigInt(_value, "value");
    if (value < 0) { throw new Error("cannot convert negative value to hex"); }

    if (value === BN_0) { return new Uint8Array([ ]); }

    let hex = value.toString(16);
    if (hex.length % 2) { hex = "0" + hex; }

    const result = new Uint8Array(hex.length / 2);
    for (let i = 0; i < result.length; i++) {
        const offset = i * 2;
        result[i] = parseInt(hex.substring(offset, offset + 2), 16);
    }

    return result;
}

/**
 *  Returns a [[HexString]] for %%value%% safe to use as a //Quantity//.
 *
 *  A //Quantity// does not have and leading 0 values unless the value is
 *  the literal value `0x0`. This is most commonly used for JSSON-RPC
 *  numeric values.
 */
export function toQuantity(value: BytesLike | BigNumberish): string {
    let result = hexlify(isBytesLike(value) ? value: toArray(value)).substring(2);
    while (result.substring(0, 1) === "0") { result = result.substring(1); }
    if (result === "") { result = "0"; }
    return "0x" + result;
}
