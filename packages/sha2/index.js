"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var bytes_1 = require("@ethersproject/bytes");
var errors = __importStar(require("@ethersproject/errors"));
var SupportedAlgorithms;
(function (SupportedAlgorithms) {
    SupportedAlgorithms["sha256"] = "sha256";
    SupportedAlgorithms["sha512"] = "sha512";
})(SupportedAlgorithms = exports.SupportedAlgorithms || (exports.SupportedAlgorithms = {}));
;
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
    if (!SupportedAlgorithms[algorithm]) {
        errors.throwError("unsupported algorithm - " + algorithm, errors.UNSUPPORTED_OPERATION, {
            operation: "computeHmac",
            algorithm: algorithm
        });
    }
    return "0x" + crypto_1.createHmac(algorithm, Buffer.from(bytes_1.arrayify(key))).update(Buffer.from(bytes_1.arrayify(data))).digest("hex");
}
exports.computeHmac = computeHmac;
