"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var bytes_1 = require("@ethersproject/bytes");
var types_1 = require("./types");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
function ripemd160(data) {
    return "0x" + crypto_1.createHash("ripemd160").update(Buffer.from(bytes_1.arrayify(data))).digest("hex");
}
exports.ripemd160 = ripemd160;
function sha256(data) {
    return "0x" + crypto_1.createHash("sha256").update(Buffer.from(bytes_1.arrayify(data))).digest("hex");
}
exports.sha256 = sha256;
function sha512(data) {
    return "0x" + crypto_1.createHash("sha512").update(Buffer.from(bytes_1.arrayify(data))).digest("hex");
}
exports.sha512 = sha512;
function computeHmac(algorithm, key, data) {
    /* istanbul ignore if */
    if (!types_1.SupportedAlgorithm[algorithm]) {
        logger.throwError("unsupported algorithm - " + algorithm, logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "computeHmac",
            algorithm: algorithm
        });
    }
    return "0x" + crypto_1.createHmac(algorithm, Buffer.from(bytes_1.arrayify(key))).update(Buffer.from(bytes_1.arrayify(data))).digest("hex");
}
exports.computeHmac = computeHmac;
//# sourceMappingURL=sha2.js.map