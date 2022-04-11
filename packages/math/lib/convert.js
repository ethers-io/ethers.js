import { logger } from "./logger.js";
// IEEE 754 support 53-bits of mantissa
const maxValue = 0x1fffffffffffff;
const nibbles = "0123456789abcdef";
const BN_0 = BigInt(0);
// Converts a value to a BigInt, including big endian data
export function toBigInt(_value) {
    if (_value instanceof Uint8Array) {
        let result = "0x0";
        for (const v of _value) {
            result += nibbles[v >> 4];
            result += nibbles[v & 0x0f];
        }
        return BigInt(result);
    }
    return logger.getBigInt(_value, "value");
}
export function toNumber(_value) {
    const value = toBigInt(_value);
    if (value < -maxValue || value > maxValue) {
        logger.throwArgumentError("overflow", "value", _value);
    }
    return Number(value);
}
// Converts value to hex, optionally padding on the left to width bytes
export function toHex(_value, _width) {
    const value = logger.getBigInt(_value, "value");
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
        const width = logger.getNumber(_width, "width");
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
export function toArray(_value) {
    const value = logger.getBigInt(_value, "value");
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
//# sourceMappingURL=convert.js.map