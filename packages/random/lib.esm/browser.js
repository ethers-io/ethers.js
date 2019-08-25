"use strict";
import { arrayify } from "@ethersproject/bytes";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
export { shuffled } from "./shuffle";
let crypto = global.crypto || global.msCrypto;
if (!crypto || !crypto.getRandomValues) {
    logger.warn("WARNING: Missing strong random number source");
    crypto = {
        getRandomValues: function (buffer) {
            return logger.throwError("no secure random source avaialble", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "crypto.getRandomValues"
            });
        }
    };
}
export function randomBytes(length) {
    if (length <= 0 || length > 1024 || parseInt(String(length)) != length) {
        logger.throwArgumentError("invalid length", "length", length);
    }
    let result = new Uint8Array(length);
    crypto.getRandomValues(result);
    return arrayify(result);
}
;
