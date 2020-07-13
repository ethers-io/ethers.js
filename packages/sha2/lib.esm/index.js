"use strict";
import { createHash, createHmac } from 'crypto';
import { arrayify } from '@ethersproject/bytes';
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
export var SupportedAlgorithm;
(function (SupportedAlgorithm) {
    SupportedAlgorithm["sha256"] = "sha256";
    SupportedAlgorithm["sha512"] = "sha512";
})(SupportedAlgorithm || (SupportedAlgorithm = {}));
;
export function ripemd160(data) {
    return "0x" + createHash("ripemd160").update(Buffer.from(arrayify(data))).digest("hex");
}
export function sha256(data) {
    return "0x" + createHash("sha256").update(Buffer.from(arrayify(data))).digest("hex");
}
export function sha512(data) {
    return "0x" + createHash("sha512").update(Buffer.from(arrayify(data))).digest("hex");
}
export function computeHmac(algorithm, key, data) {
    /* istanbul ignore if */
    if (!SupportedAlgorithm[algorithm]) {
        logger.throwError("unsupported algorithm - " + algorithm, Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "computeHmac",
            algorithm: algorithm
        });
    }
    return "0x" + createHmac(algorithm, Buffer.from(arrayify(key))).update(Buffer.from(arrayify(data))).digest("hex");
}
//# sourceMappingURL=index.js.map