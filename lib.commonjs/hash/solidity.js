"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solidityPackedSha256 = exports.solidityPackedKeccak256 = exports.solidityPacked = void 0;
const index_js_1 = require("../crypto/index.js");
const index_js_2 = require("../utils/index.js");
const regexBytes = new RegExp("^bytes([0-9]+)$");
const regexNumber = new RegExp("^(u?int)([0-9]*)$");
const regexArray = new RegExp("^(.*)\\[([0-9]*)\\]$");
function _pack(type, value, isArray) {
    switch (type) {
        case "address":
            if (isArray) {
                return (0, index_js_2.getBytes)((0, index_js_2.zeroPadValue)(value, 32));
            }
            return (0, index_js_2.getBytes)(value);
        case "string":
            return (0, index_js_2.toUtf8Bytes)(value);
        case "bytes":
            return (0, index_js_2.getBytes)(value);
        case "bool":
            value = (!!value ? "0x01" : "0x00");
            if (isArray) {
                return (0, index_js_2.getBytes)((0, index_js_2.zeroPadValue)(value, 32));
            }
            return (0, index_js_2.getBytes)(value);
    }
    let match = type.match(regexNumber);
    if (match) {
        let size = parseInt(match[2] || "256");
        if ((match[2] && String(size) !== match[2]) || (size % 8 !== 0) || size === 0 || size > 256) {
            return (0, index_js_2.throwArgumentError)("invalid number type", "type", type);
        }
        if (isArray) {
            size = 256;
        }
        value = (0, index_js_2.toTwos)(value, size);
        return (0, index_js_2.getBytes)((0, index_js_2.zeroPadValue)((0, index_js_2.toArray)(value), size / 8));
    }
    match = type.match(regexBytes);
    if (match) {
        const size = parseInt(match[1]);
        if (String(size) !== match[1] || size === 0 || size > 32) {
            return (0, index_js_2.throwArgumentError)("invalid bytes type", "type", type);
        }
        if ((0, index_js_2.dataLength)(value) !== size) {
            return (0, index_js_2.throwArgumentError)(`invalid value for ${type}`, "value", value);
        }
        if (isArray) {
            return (0, index_js_2.getBytes)((0, index_js_2.zeroPadBytes)(value, 32));
        }
        return value;
    }
    match = type.match(regexArray);
    if (match && Array.isArray(value)) {
        const baseType = match[1];
        const count = parseInt(match[2] || String(value.length));
        if (count != value.length) {
            (0, index_js_2.throwArgumentError)(`invalid array length for ${type}`, "value", value);
        }
        const result = [];
        value.forEach(function (value) {
            result.push(_pack(baseType, value, true));
        });
        return (0, index_js_2.getBytes)((0, index_js_2.concat)(result));
    }
    return (0, index_js_2.throwArgumentError)("invalid type", "type", type);
}
// @TODO: Array Enum
function solidityPacked(types, values) {
    if (types.length != values.length) {
        (0, index_js_2.throwArgumentError)("wrong number of values; expected ${ types.length }", "values", values);
    }
    const tight = [];
    types.forEach(function (type, index) {
        tight.push(_pack(type, values[index]));
    });
    return (0, index_js_2.hexlify)((0, index_js_2.concat)(tight));
}
exports.solidityPacked = solidityPacked;
/**
 *   Computes the non-standard packed (tightly packed) keccak256 hash of
 *   the values given the types.
 *
 *   @param {Array<string>} types - The Solidity types to interpret each value as [default: bar]
 *   @param {Array<any>} values - The values to pack
 *
 *   @returns: {HexString} the hexstring of the hash
 *   @example:
 *       solidityPackedKeccak256([ "address", "uint" ], [ "0x1234", 45 ]);
 *       //_result:
 *
 *   @see https://docs.soliditylang.org/en/v0.8.14/abi-spec.html#non-standard-packed-mode
 */
function solidityPackedKeccak256(types, values) {
    return (0, index_js_1.keccak256)(solidityPacked(types, values));
}
exports.solidityPackedKeccak256 = solidityPackedKeccak256;
function solidityPackedSha256(types, values) {
    return (0, index_js_1.sha256)(solidityPacked(types, values));
}
exports.solidityPackedSha256 = solidityPackedSha256;
//# sourceMappingURL=solidity.js.map