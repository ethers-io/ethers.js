import { concat, dataLength, hexlify, logger, toArray, toTwos, toUtf8Bytes, zeroPadBytes, zeroPadValue } from "../utils/index.js";
import { keccak256 as _keccak256 } from "../crypto/keccak.js";
import { sha256 as _sha256 } from "../crypto/sha2.js";
const regexBytes = new RegExp("^bytes([0-9]+)$");
const regexNumber = new RegExp("^(u?int)([0-9]*)$");
const regexArray = new RegExp("^(.*)\\[([0-9]*)\\]$");
function _pack(type, value, isArray) {
    switch (type) {
        case "address":
            if (isArray) {
                return logger.getBytes(zeroPadValue(value, 32));
            }
            return logger.getBytes(value);
        case "string":
            return toUtf8Bytes(value);
        case "bytes":
            return logger.getBytes(value);
        case "bool":
            value = (!!value ? "0x01" : "0x00");
            if (isArray) {
                return logger.getBytes(zeroPadValue(value, 32));
            }
            return logger.getBytes(value);
    }
    let match = type.match(regexNumber);
    if (match) {
        let size = parseInt(match[2] || "256");
        if ((match[2] && String(size) !== match[2]) || (size % 8 !== 0) || size === 0 || size > 256) {
            return logger.throwArgumentError("invalid number type", "type", type);
        }
        if (isArray) {
            size = 256;
        }
        value = toTwos(value, size);
        return logger.getBytes(zeroPadValue(toArray(value), size / 8));
    }
    match = type.match(regexBytes);
    if (match) {
        const size = parseInt(match[1]);
        if (String(size) !== match[1] || size === 0 || size > 32) {
            return logger.throwArgumentError("invalid bytes type", "type", type);
        }
        if (dataLength(value) !== size) {
            return logger.throwArgumentError(`invalid value for ${type}`, "value", value);
        }
        if (isArray) {
            return logger.getBytes(zeroPadBytes(value, 32));
        }
        return value;
    }
    match = type.match(regexArray);
    if (match && Array.isArray(value)) {
        const baseType = match[1];
        const count = parseInt(match[2] || String(value.length));
        if (count != value.length) {
            logger.throwArgumentError(`invalid array length for ${type}`, "value", value);
        }
        const result = [];
        value.forEach(function (value) {
            result.push(_pack(baseType, value, true));
        });
        return logger.getBytes(concat(result));
    }
    return logger.throwArgumentError("invalid type", "type", type);
}
// @TODO: Array Enum
export function solidityPacked(types, values) {
    if (types.length != values.length) {
        logger.throwArgumentError("wrong number of values; expected ${ types.length }", "values", values);
    }
    const tight = [];
    types.forEach(function (type, index) {
        tight.push(_pack(type, values[index]));
    });
    return hexlify(concat(tight));
}
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
export function solidityPackedKeccak256(types, values) {
    return _keccak256(solidityPacked(types, values));
}
/**
 *  Test Function, for fun
 *
 *  @param foo - something fun
 */
export function test(foo) {
}
export function solidityPackedSha256(types, values) {
    return _sha256(solidityPacked(types, values));
}
//# sourceMappingURL=solidity.js.map