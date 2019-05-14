"use strict";

import { arrayify } from "@ethersproject/bytes";
import * as errors from"@ethersproject/errors";

export { shuffled } from "./shuffle";

let crypto: any = (<any>global).crypto || (<any>global).msCrypto;
if (!crypto || !crypto.getRandomValues) {

    errors.warn("WARNING: Missing strong random number source");

    crypto = {
        getRandomValues: function(buffer: Uint8Array): Uint8Array {
            return errors.throwError("no secure random source avaialble", errors.UNSUPPORTED_OPERATION, {
                operation: "crypto.getRandomValues"
            });
        }
    };
}

export function randomBytes(length: number): Uint8Array {
    if (length <= 0 || length > 1024 || parseInt(String(length)) != length) {
        errors.throwError("invalid length", errors.INVALID_ARGUMENT, {
            argument: "length",
            value: length
        });
    }

    let result = new Uint8Array(length);
    crypto.getRandomValues(result);
    return arrayify(result);
};
