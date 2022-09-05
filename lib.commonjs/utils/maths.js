"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toQuantity = exports.toArray = exports.toHex = exports.toNumber = exports.toBigInt = exports.mask = exports.toTwos = exports.fromTwos = void 0;
const data_js_1 = require("./data.js");
const logger_js_1 = require("./logger.js");
const BN_0 = BigInt(0);
const BN_1 = BigInt(1);
/**
 *  Convert %%value%% from a twos-compliment value of %%width%% bits.
 */
function fromTwos(_value, _width) {
    const value = logger_js_1.logger.getBigInt(_value, "value");
    const width = BigInt(logger_js_1.logger.getNumber(_width, "width"));
    // Top bit set; treat as a negative value
    if (value >> (width - BN_1)) {
        const mask = (BN_1 << width) - BN_1;
        return -(((~value) & mask) + BN_1);
    }
    return value;
}
exports.fromTwos = fromTwos;
/**
 *  Convert %%value%% to a twos-compliment value of %%width%% bits.
 */
function toTwos(_value, _width) {
    const value = logger_js_1.logger.getBigInt(_value, "value");
    const width = BigInt(logger_js_1.logger.getNumber(_width, "width"));
    if (value < BN_0) {
        const mask = (BN_1 << width) - BN_1;
        return ((~(-value)) & mask) + BN_1;
    }
    return value;
}
exports.toTwos = toTwos;
/**
 *  Mask %%value%% with a bitmask of %%bits%% ones.
 */
function mask(_value, _bits) {
    const value = logger_js_1.logger.getBigInt(_value, "value");
    const bits = BigInt(logger_js_1.logger.getNumber(_bits, "bits"));
    return value & ((BN_1 << bits) - BN_1);
}
exports.mask = mask;
/*
 * Converts %%value%% to a BigInt. If %%value%% is a Uint8Array, it
 * is treated as Big Endian data.
 */
const Nibbles = "0123456789abcdef";
function toBigInt(value) {
    if (value instanceof Uint8Array) {
        let result = "0x0";
        for (const v of value) {
            result += Nibbles[v >> 4];
            result += Nibbles[v & 0x0f];
        }
        return BigInt(result);
    }
    return logger_js_1.logger.getBigInt(value);
}
exports.toBigInt = toBigInt;
/*
 * Converts %%value%% to a number. If %%value%% is a Uint8Array, it
 * is treated as Big Endian data. Throws if the value is not safe.
 */
function toNumber(value) {
    return logger_js_1.logger.getNumber(toBigInt(value));
}
exports.toNumber = toNumber;
/**
 *  Converts %%value%% to a Big Endian hexstring, optionally padded to
 *  %%width%% bytes.
 */
// Converts value to hex, optionally padding on the left to width bytes
function toHex(_value, _width) {
    const value = logger_js_1.logger.getBigInt(_value, "value");
    if (value < 0) {
        throw new Error("cannot convert negative value to hex");
    }
    let result = value.toString(16);
    if (_width == null) {
        // Ensure the value is of even length
        if (result.length % 2) {
            result = "0" + result;
        }
    }
    else {
        const width = logger_js_1.logger.getNumber(_width, "width");
        if (width * 2 < result.length) {
            throw new Error(`value ${value} exceeds width ${width}`);
        }
        // Pad the value to the required width
        while (result.length < (width * 2)) {
            result = "0" + result;
        }
    }
    return "0x" + result;
}
exports.toHex = toHex;
/**
 *  Converts %%value%% to a Big Endian Uint8Array.
 */
function toArray(_value) {
    const value = logger_js_1.logger.getBigInt(_value, "value");
    if (value < 0) {
        throw new Error("cannot convert negative value to hex");
    }
    if (value === BN_0) {
        return new Uint8Array([]);
    }
    let hex = value.toString(16);
    if (hex.length % 2) {
        hex = "0" + hex;
    }
    const result = new Uint8Array(hex.length / 2);
    for (let i = 0; i < result.length; i++) {
        const offset = i * 2;
        result[i] = parseInt(hex.substring(offset, offset + 2), 16);
    }
    return result;
}
exports.toArray = toArray;
function toQuantity(value) {
    let result = (0, data_js_1.hexlify)((0, data_js_1.isBytesLike)(value) ? value : toArray(value)).substring(2);
    while (result.substring(0, 1) === "0") {
        result = result.substring(1);
    }
    if (result === "") {
        result = "0";
    }
    return "0x" + result;
}
exports.toQuantity = toQuantity;
//# sourceMappingURL=maths.js.map