import {
    concat, dataLength, hexlify, zeroPadBytes, zeroPadValue
} from "@ethersproject/bytes";
import { keccak256 as _keccak256, sha256 as _sha256 } from "@ethersproject/crypto";
import { toTwos } from "@ethersproject/math";
import { toUtf8Bytes } from "@ethersproject/strings";

import { logger } from "./logger.js";


const regexBytes = new RegExp("^bytes([0-9]+)$");
const regexNumber = new RegExp("^(u?int)([0-9]*)$");
const regexArray = new RegExp("^(.*)\\[([0-9]*)\\]$");


function _pack(type: string, value: any, isArray?: boolean): Uint8Array {
    switch(type) {
        case "address":
            if (isArray) { return logger.getBytes(zeroPadValue(value, 32)); }
            return logger.getBytes(value);
        case "string":
            return toUtf8Bytes(value);
        case "bytes":
            return logger.getBytes(value);
        case "bool":
            value = (!!value ? "0x01": "0x00");
            if (isArray) { return logger.getBytes(zeroPadValue(value, 32)); }
            return logger.getBytes(value);
    }

    let match =  type.match(regexNumber);
    if (match) {
        let size = parseInt(match[2] || "256")

        if ((match[2] && String(size) !== match[2]) || (size % 8 !== 0) || size === 0 || size > 256) {
            return logger.throwArgumentError("invalid number type", "type", type)
        }

        if (isArray) { size = 256; }

        value = toTwos(value, size);

        return logger.getBytes(zeroPadValue(value, size / 8));
    }

    match = type.match(regexBytes);
    if (match) {
        const size = parseInt(match[1]);

        if (String(size) !== match[1] || size === 0 || size > 32) {
            return logger.throwArgumentError("invalid bytes type", "type", type)
        }
        if (dataLength(value) !== size) {
            return logger.throwArgumentError(`invalid value for ${ type }`, "value", value)
        }
        if (isArray) { return logger.getBytes(zeroPadBytes(value, 32)); }
        return value;
    }

    match = type.match(regexArray);
    if (match && Array.isArray(value)) {
        const baseType = match[1];
        const count = parseInt(match[2] || String(value.length));
        if (count != value.length) {
            logger.throwArgumentError(`invalid array length for ${ type }`, "value", value)
        }
        const result: Array<Uint8Array> = [];
        value.forEach(function(value) {
            result.push(_pack(baseType, value, true));
        });
        return logger.getBytes(concat(result));
    }

    return logger.throwArgumentError("invalid type", "type", type)
}

// @TODO: Array Enum

export function solidityPacked(types: ReadonlyArray<string>, values: ReadonlyArray<any>) {
    if (types.length != values.length) {
        logger.throwArgumentError("wrong number of values; expected ${ types.length }", "values", values)
    }
    const tight: Array<Uint8Array> = [];
    types.forEach(function(type, index) {
        tight.push(_pack(type, values[index]));
    });
    return hexlify(concat(tight));
}

export function solidityPackedKeccak256(types: ReadonlyArray<string>, values: ReadonlyArray<any>) {
    return _keccak256(solidityPacked(types, values));
}

export function solidityPackedSha256(types: ReadonlyArray<string>, values: ReadonlyArray<any>) {
    return _sha256(solidityPacked(types, values));
}
