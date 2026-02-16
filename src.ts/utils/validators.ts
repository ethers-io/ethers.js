/**
 *  Common validation utilities for Ethereum types.
 *
 *  These functions provide safe, non-throwing validation for common
 *  Ethereum data types, making it easier to validate user input
 *  before processing.
 *
 *  @_subsection: api/utils:Validators  [about-validators]
 */

import { getBytes, isHexString, dataLength } from "./data.js";
import { assertArgument } from "./errors.js";
import { getBigInt, getNumber } from "./maths.js";

import type { BigNumberish, BytesLike } from "./index.js";


/**
 *  Returns true if %%value%% is a valid private key (32 bytes hex string
 *  or Uint8Array).
 *
 *  This does NOT check if the key is within the secp256k1 curve order,
 *  only that it has the correct format and length.
 *
 *  @example:
 *    isValidPrivateKey("0x0123456789012345678901234567890123456789012345678901234567890123")
 *    //_result:
 *
 *    isValidPrivateKey("0x1234")
 *    //_result:
 */
export function isValidPrivateKey(value: any): boolean {
    try {
        if (value instanceof Uint8Array) {
            return value.length === 32;
        }
        if (typeof value === "string") {
            return isHexString(value, 32);
        }
    } catch (e) { }
    return false;
}

/**
 *  Returns true if %%value%% is a valid bytes32 value (e.g. a hash).
 *
 *  @example:
 *    isValidBytes32("0x" + "ab".repeat(32))
 *    //_result:
 *
 *    isValidBytes32("0x1234")
 *    //_result:
 */
export function isValidBytes32(value: any): boolean {
    if (value instanceof Uint8Array) {
        return value.length === 32;
    }
    return isHexString(value, 32);
}

/**
 *  Returns true if %%value%% is a valid transaction hash (bytes32 hex string).
 *
 *  @example:
 *    isValidTransactionHash("0x" + "ab".repeat(32))
 *    //_result:
 *
 *    isValidTransactionHash("0x1234")
 *    //_result:
 */
export function isValidTransactionHash(value: any): boolean {
    return typeof value === "string" && isHexString(value, 32);
}

/**
 *  Returns true if %%value%% is a valid block tag.
 *
 *  Valid block tags include: "latest", "earliest", "pending", "safe",
 *  "finalized", a non-negative integer, or a hex-encoded block number.
 *
 *  @example:
 *    isValidBlockTag("latest")
 *    //_result:
 *
 *    isValidBlockTag(12345)
 *    //_result:
 *
 *    isValidBlockTag("0x3039")
 *    //_result:
 *
 *    isValidBlockTag(-1)
 *    //_result:
 */
export function isValidBlockTag(value: any): boolean {
    if (typeof value === "string") {
        if ([ "latest", "earliest", "pending", "safe", "finalized" ].indexOf(value) >= 0) {
            return true;
        }
        // Hex-encoded block number
        if (value.match(/^0x[0-9a-fA-F]+$/)) {
            return true;
        }
        return false;
    }
    if (typeof value === "number") {
        return Number.isInteger(value) && value >= 0;
    }
    if (typeof value === "bigint") {
        return value >= BigInt(0);
    }
    return false;
}

/**
 *  Validates and normalizes a hex data string, ensuring it has
 *  the ``0x`` prefix, an even number of characters, and only
 *  contains valid hex characters.
 *
 *  Throws an [[ArgumentError]] if the value is invalid.
 *
 *  @example:
 *    normalizeHexData("0x1234")
 *    //_result:
 *
 *    normalizeHexData("1234")
 *    //_result:
 *
 *    normalizeHexData("0xGG")
 *    //_error:
 */
export function normalizeHexData(value: string): string {
    assertArgument(typeof value === "string", "value must be a string", "value", value);

    // Add 0x prefix if missing
    let hex = value;
    if (!hex.startsWith("0x")) {
        hex = "0x" + hex;
    }

    assertArgument(
        hex.match(/^0x[0-9a-fA-F]*$/),
        "invalid hex characters",
        "value", value
    );

    assertArgument(
        hex.length % 2 === 0,
        "hex data must have even length",
        "value", value
    );

    return hex.toLowerCase();
}

/**
 *  Validates that %%value%% is a valid Solidity type string.
 *
 *  Supports: address, bool, string, bytes, bytesN (1-32),
 *  uintN, intN (8-256, multiples of 8), and arrays of these types.
 *
 *  @example:
 *    isValidSolidityType("uint256")
 *    //_result:
 *
 *    isValidSolidityType("address")
 *    //_result:
 *
 *    isValidSolidityType("uint7")
 *    //_result:
 *
 *    isValidSolidityType("foo")
 *    //_result:
 */
export function isValidSolidityType(type: string): boolean {
    if (typeof type !== "string") { return false; }

    // Strip array suffix for base type check
    const arrayMatch = type.match(/^(.+?)(\[([0-9]*)\])*$/);
    if (!arrayMatch) { return false; }
    const baseType = arrayMatch[1];

    // Simple types
    if ([ "address", "bool", "string", "bytes" ].indexOf(baseType) >= 0) {
        return true;
    }

    // bytesN
    const bytesMatch = baseType.match(/^bytes([0-9]+)$/);
    if (bytesMatch) {
        const size = parseInt(bytesMatch[1]);
        return size >= 1 && size <= 32 && String(size) === bytesMatch[1];
    }

    // uintN / intN
    const intMatch = baseType.match(/^(u?int)([0-9]*)$/);
    if (intMatch) {
        const size = parseInt(intMatch[2] || "256");
        return size >= 8 && size <= 256 && size % 8 === 0;
    }

    // tuple type (basic check)
    if (baseType === "tuple") { return true; }

    return false;
}

/**
 *  Clamps a BigInt %%value%% to the range [%%min%%, %%max%%].
 *
 *  This is useful for ensuring values stay within valid ranges
 *  for specific Solidity integer types.
 *
 *  @example:
 *    // Clamp to uint8 range
 *    clampBigInt(300n, 0n, 255n)
 *    //_result:
 *
 *    clampBigInt(-5n, 0n, 255n)
 *    //_result:
 *
 *    clampBigInt(100n, 0n, 255n)
 *    //_result:
 */
export function clampBigInt(value: bigint, min: bigint, max: bigint): bigint {
    assertArgument(typeof value === "bigint", "value must be a bigint", "value", value);
    assertArgument(typeof min === "bigint", "min must be a bigint", "min", min);
    assertArgument(typeof max === "bigint", "max must be a bigint", "max", max);
    assertArgument(min <= max, "min must be <= max", "min", min);

    if (value < min) { return min; }
    if (value > max) { return max; }
    return value;
}

/**
 *  Returns the minimum and maximum values for a Solidity integer type.
 *
 *  @example:
 *    getIntegerRange("uint8")
 *    //_result:
 *
 *    getIntegerRange("int8")
 *    //_result:
 *
 *    getIntegerRange("uint256")
 *    //_result:
 */
export function getIntegerRange(type: string): { min: bigint, max: bigint } {
    assertArgument(typeof type === "string", "type must be a string", "type", type);

    const match = type.match(/^(u?int)([0-9]*)$/);
    assertArgument(match != null, "invalid integer type", "type", type);

    const signed = match[1] === "int";
    const bits = parseInt(match[2] || "256");

    assertArgument(bits >= 8 && bits <= 256 && bits % 8 === 0, "invalid integer bit width", "type", type);

    if (signed) {
        const limit = BigInt(1) << BigInt(bits - 1);
        return { min: -limit, max: limit - BigInt(1) };
    }

    return { min: BigInt(0), max: (BigInt(1) << BigInt(bits)) - BigInt(1) };
}

/**
 *  Returns true if %%value%% fits within the specified Solidity
 *  integer %%type%%.
 *
 *  @example:
 *    fitsInType(255n, "uint8")
 *    //_result:
 *
 *    fitsInType(256n, "uint8")
 *    //_result:
 *
 *    fitsInType(-128n, "int8")
 *    //_result:
 *
 *    fitsInType(-129n, "int8")
 *    //_result:
 */
export function fitsInType(value: BigNumberish, type: string): boolean {
    try {
        const bigValue = getBigInt(value);
        const range = getIntegerRange(type);
        return bigValue >= range.min && bigValue <= range.max;
    } catch (e) {
        return false;
    }
}

/**
 *  Validates that %%data%% has exactly %%expectedLength%% bytes.
 *
 *  Throws an [[ArgumentError]] if the length does not match.
 *
 *  @example:
 *    assertDataLength("0x1234", 2)
 *    // (no error)
 *
 *    assertDataLength("0x1234", 3)
 *    //_error:
 */
export function assertDataLength(data: BytesLike, expectedLength: number, name?: string): void {
    const length = dataLength(data);
    assertArgument(
        length === expectedLength,
        `expected ${ expectedLength } bytes, got ${ length }`,
        name || "data",
        data
    );
}

/**
 *  Safely converts a BigNumberish %%value%% to a number, returning
 *  %%defaultValue%% if the conversion fails (e.g., overflow,
 *  invalid format).
 *
 *  @example:
 *    safeToNumber("42", -1)
 *    //_result:
 *
 *    safeToNumber("not-a-number", -1)
 *    //_result:
 */
export function safeToNumber(value: any, defaultValue: number): number {
    try {
        return getNumber(value);
    } catch (e) {
        return defaultValue;
    }
}

/**
 *  Safely converts a BigNumberish %%value%% to a bigint, returning
 *  %%defaultValue%% if the conversion fails.
 *
 *  @example:
 *    safeToBigInt("42", 0n)
 *    //_result:
 *
 *    safeToBigInt("not-a-number", 0n)
 *    //_result:
 */
export function safeToBigInt(value: any, defaultValue: bigint): bigint {
    try {
        return getBigInt(value);
    } catch (e) {
        return defaultValue;
    }
}
