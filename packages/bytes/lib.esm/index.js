"use strict";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
///////////////////////////////
function isHexable(value) {
    return !!(value.toHexString);
}
function addSlice(array) {
    if (array.slice) {
        return array;
    }
    array.slice = function () {
        let args = Array.prototype.slice.call(arguments);
        return addSlice(new Uint8Array(Array.prototype.slice.apply(array, args)));
    };
    return array;
}
export function isBytesLike(value) {
    return ((isHexString(value) && !(value.length % 2)) || isBytes(value));
}
export function isBytes(value) {
    if (value == null) {
        return false;
    }
    if (value.constructor === Uint8Array) {
        return true;
    }
    if (typeof (value) === "string") {
        return false;
    }
    if (value.length == null) {
        return false;
    }
    for (let i = 0; i < value.length; i++) {
        let v = value[i];
        if (v < 0 || v >= 256 || (v % 1)) {
            return false;
        }
    }
    return true;
}
export function arrayify(value, options) {
    if (!options) {
        options = {};
    }
    if (typeof (value) === "number") {
        logger.checkSafeUint53(value, "invalid arrayify value");
        let result = [];
        while (value) {
            result.unshift(value & 0xff);
            value /= 256;
        }
        if (result.length === 0) {
            result.push(0);
        }
        return addSlice(new Uint8Array(result));
    }
    if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }
    if (isHexable(value)) {
        value = value.toHexString();
    }
    if (isHexString(value)) {
        let hex = value.substring(2);
        if (!options.allowOddLength && hex.length % 2) {
            logger.throwArgumentError("hex data is odd-length", "value", value);
        }
        let result = [];
        for (let i = 0; i < hex.length; i += 2) {
            result.push(parseInt(hex.substring(i, i + 2), 16));
        }
        return addSlice(new Uint8Array(result));
    }
    if (isBytes(value)) {
        return addSlice(new Uint8Array(value));
    }
    return logger.throwArgumentError("invalid arrayify value", "value", value);
}
export function concat(items) {
    let objects = items.map(item => arrayify(item));
    let length = objects.reduce((accum, item) => (accum + item.length), 0);
    let result = new Uint8Array(length);
    objects.reduce((offset, object) => {
        result.set(object, offset);
        return offset + object.length;
    }, 0);
    return addSlice(result);
}
export function stripZeros(value) {
    let result = arrayify(value);
    if (result.length === 0) {
        return result;
    }
    // Find the first non-zero entry
    let start = 0;
    while (start < result.length && result[start] === 0) {
        start++;
    }
    // If we started with zeros, strip them
    if (start) {
        result = result.slice(start);
    }
    return result;
}
export function zeroPad(value, length) {
    value = arrayify(value);
    if (value.length > length) {
        logger.throwArgumentError("value out of range", "value", arguments[0]);
    }
    let result = new Uint8Array(length);
    result.set(value, length - value.length);
    return addSlice(result);
}
export function isHexString(value, length) {
    if (typeof (value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false;
    }
    if (length && value.length !== 2 + 2 * length) {
        return false;
    }
    return true;
}
const HexCharacters = "0123456789abcdef";
export function hexlify(value, options) {
    if (!options) {
        options = {};
    }
    if (typeof (value) === "number") {
        logger.checkSafeUint53(value, "invalid hexlify value");
        let hex = "";
        while (value) {
            hex = HexCharacters[value & 0x0f] + hex;
            value = Math.floor(value / 16);
        }
        if (hex.length) {
            if (hex.length % 2) {
                hex = "0" + hex;
            }
            return "0x" + hex;
        }
        return "0x00";
    }
    if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }
    if (isHexable(value)) {
        return value.toHexString();
    }
    if (isHexString(value)) {
        if (!options.allowOddLength && value.length % 2) {
            logger.throwArgumentError("hex data is odd-length", "value", value);
        }
        return value.toLowerCase();
    }
    if (isBytes(value)) {
        let result = "0x";
        for (let i = 0; i < value.length; i++) {
            let v = value[i];
            result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
        }
        return result;
    }
    return logger.throwArgumentError("invalid hexlify value", "value", value);
}
/*
function unoddify(value: BytesLike | Hexable | number): BytesLike | Hexable | number {
    if (typeof(value) === "string" && value.length % 2 && value.substring(0, 2) === "0x") {
        return "0x0" + value.substring(2);
    }
    return value;
}
*/
export function hexDataLength(data) {
    if (typeof (data) !== "string") {
        data = hexlify(data);
    }
    else if (!isHexString(data) || (data.length % 2)) {
        return null;
    }
    return (data.length - 2) / 2;
}
export function hexDataSlice(data, offset, endOffset) {
    if (typeof (data) !== "string") {
        data = hexlify(data);
    }
    else if (!isHexString(data) || (data.length % 2)) {
        logger.throwArgumentError("invalid hexData", "value", data);
    }
    offset = 2 + 2 * offset;
    if (endOffset != null) {
        return "0x" + data.substring(offset, 2 + 2 * endOffset);
    }
    return "0x" + data.substring(offset);
}
export function hexConcat(items) {
    let result = "0x";
    items.forEach((item) => {
        result += hexlify(item).substring(2);
    });
    return result;
}
export function hexValue(value) {
    let trimmed = hexStripZeros(hexlify(value, { allowOddLength: true }));
    if (trimmed === "0x") {
        return "0x0";
    }
    return trimmed;
}
export function hexStripZeros(value) {
    if (typeof (value) !== "string") {
        value = hexlify(value);
    }
    if (!isHexString(value)) {
        logger.throwArgumentError("invalid hex string", "value", value);
    }
    value = value.substring(2);
    let offset = 0;
    while (offset < value.length && value[offset] === "0") {
        offset++;
    }
    return "0x" + value.substring(offset);
}
export function hexZeroPad(value, length) {
    if (typeof (value) !== "string") {
        value = hexlify(value);
    }
    else if (!isHexString(value)) {
        logger.throwArgumentError("invalid hex string", "value", value);
    }
    if (value.length > 2 * length + 2) {
        logger.throwArgumentError("value out of range", "value", arguments[1]);
    }
    while (value.length < 2 * length + 2) {
        value = "0x0" + value.substring(2);
    }
    return value;
}
export function splitSignature(signature) {
    let result = {
        r: "0x",
        s: "0x",
        _vs: "0x",
        recoveryParam: 0,
        v: 0
    };
    if (isBytesLike(signature)) {
        let bytes = arrayify(signature);
        if (bytes.length !== 65) {
            logger.throwArgumentError("invalid signature string; must be 65 bytes", "signature", signature);
        }
        // Get the r and s
        result.r = hexlify(bytes.slice(0, 32));
        result.s = hexlify(bytes.slice(32, 64));
        // Reduce v to the canonical 27 or 28
        result.v = bytes[64];
        if (result.v !== 27 && result.v !== 28) {
            result.v = 27 + (result.v % 2);
        }
        // Compute recoveryParam from v
        result.recoveryParam = (result.v - 27);
        // Compute _vs from recoveryParam and s
        if (result.recoveryParam) {
            bytes[32] |= 0x80;
        }
        result._vs = hexlify(bytes.slice(32, 64));
    }
    else {
        result.r = signature.r;
        result.s = signature.s;
        result.v = signature.v;
        result.recoveryParam = signature.recoveryParam;
        result._vs = signature._vs;
        // Normalize v into a canonical 27 or 28
        if (result.v != null && !(result.v == 27 || result.v == 28)) {
            result.v = 27 + (result.v % 2);
        }
        // Populate a missing v or recoveryParam if possible
        if (result.recoveryParam == null && result.v != null) {
            result.recoveryParam = 1 - (result.v % 2);
        }
        else if (result.recoveryParam != null && result.v == null) {
            result.v = 27 + result.recoveryParam;
        }
        else if (result.recoveryParam != null && result.v != null) {
            if (result.v !== 27 + result.recoveryParam) {
                logger.throwArgumentError("signature v mismatch recoveryParam", "signature", signature);
            }
        }
        // Make sure r and s are padded properly
        if (result.r != null) {
            result.r = hexZeroPad(result.r, 32);
        }
        if (result.s != null) {
            result.s = hexZeroPad(result.s, 32);
        }
        // If the _vs is available, use it to populate missing s, v and recoveryParam
        // and verify non-missing s, v and recoveryParam
        if (result._vs != null) {
            result._vs = hexZeroPad(result._vs, 32);
            if (result._vs.length > 66) {
                logger.throwArgumentError("signature _vs overflow", "signature", signature);
            }
            let vs = arrayify(result._vs);
            let recoveryParam = ((vs[0] >= 128) ? 1 : 0);
            let v = 27 + result.recoveryParam;
            // Use _vs to compute s
            vs[0] &= 0x7f;
            let s = hexlify(vs);
            // Check _vs aggress with other parameters
            if (result.s == null) {
                result.s = s;
            }
            else if (result.s !== s) {
                logger.throwArgumentError("signature v mismatch _vs", "signature", signature);
            }
            if (result.v == null) {
                result.v = v;
            }
            else if (result.v !== v) {
                logger.throwArgumentError("signature v mismatch _vs", "signature", signature);
            }
            if (recoveryParam == null) {
                result.recoveryParam = recoveryParam;
            }
            else if (result.recoveryParam !== recoveryParam) {
                logger.throwArgumentError("signature recoveryParam mismatch _vs", "signature", signature);
            }
        }
        // After all populating, both v and recoveryParam are still missing...
        if (result.v == null && result.recoveryParam == null) {
            logger.throwArgumentError("signature requires at least one of recoveryParam, v or _vs", "signature", signature);
        }
        // Check for canonical v
        if (result.v !== 27 && result.v !== 28) {
            logger.throwArgumentError("signature v not canonical", "signature", signature);
        }
        // Check that r and s are in range
        if (result.r.length > 66 || result.s.length > 66) {
            logger.throwArgumentError("signature overflow r or s", "signature", signature);
        }
        if (result._vs == null) {
            let vs = arrayify(result.s);
            if (vs[0] >= 128) {
                logger.throwArgumentError("signature s out of range", "signature", signature);
            }
            if (result.recoveryParam) {
                vs[0] |= 0x80;
            }
            result._vs = hexlify(vs);
        }
    }
    return result;
}
export function joinSignature(signature) {
    signature = splitSignature(signature);
    return hexlify(concat([
        signature.r,
        signature.s,
        (signature.recoveryParam ? "0x1c" : "0x1b")
    ]));
}
