import { isBytesLike } from "./check.js";
import { logger } from "./logger.js";
let BN_8 = null;
let BN_255 = null;
try {
    BN_8 = BigInt("8");
    BN_255 = BigInt("255");
}
catch (error) {
    console.log("Unsupported bigint", error);
}
function isHexable(value) {
    return (value && typeof (value.toHexString) === "function");
}
export function arrayify(data) {
    if (data == null) {
        logger.throwArgumentError("cannot arrayify nullish", "data", data);
    }
    if (typeof (data) === "number") {
        logger.assertUint53(data);
        const result = [];
        while (data) {
            result.unshift(data & 0xff);
            data = parseInt(String(data / 256));
        }
        if (result.length === 0) {
            result.push(0);
        }
        return new Uint8Array(result);
    }
    if (BN_8 && typeof (data) === "bigint") {
        const result = [];
        while (data) {
            result.unshift(Number(data & BN_255));
            data >>= BN_8;
        }
        if (result.length === 0) {
            result.push(0);
        }
        return new Uint8Array(result);
    }
    if (isHexable(data)) {
        return arrayify(data.toHexString());
    }
    if (typeof (data) === "string") {
        let hex = data;
        //if (options.allowMissingPrefix && hex.substring(0, 2) !== "0x") {
        //    hex = "0x" + hex;
        //}
        if (!hex.match(/^0x[0-9a-f]*$/i)) {
            throw new RangeError(`invalid hex data string (${JSON.stringify(data)})`);
        }
        const result = [];
        for (let i = 2; i < hex.length; i += 2) {
            result.push(parseInt(hex.substring(i, i + 2), 16));
        }
        return new Uint8Array(result);
    }
    if (data instanceof Uint8Array) {
        return new Uint8Array(data);
    }
    throw new TypeError(`cannot arrayify ${JSON.stringify(data)}`);
}
export function _noCopyArrayify(data) {
    if (!isBytesLike(data)) {
        logger.throwArgumentError("invalid BytesLike value", "data", data);
    } // @TODO: ArgumentE>
    if (data instanceof Uint8Array) {
        return data;
    }
    return arrayify(data);
}
//# sourceMappingURL=array.js.map