"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var hash = __importStar(require("hash.js"));
var bytes_1 = require("@ethersproject/bytes");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var SupportedAlgorithm;
(function (SupportedAlgorithm) {
    SupportedAlgorithm["sha256"] = "sha256";
    SupportedAlgorithm["sha512"] = "sha512";
})(SupportedAlgorithm = exports.SupportedAlgorithm || (exports.SupportedAlgorithm = {}));
;
function ripemd160(data) {
    return "0x" + (hash.ripemd160().update(bytes_1.arrayify(data)).digest("hex"));
}
exports.ripemd160 = ripemd160;
function sha256(data) {
    return "0x" + (hash.sha256().update(bytes_1.arrayify(data)).digest("hex"));
}
exports.sha256 = sha256;
function sha512(data) {
    return "0x" + (hash.sha512().update(bytes_1.arrayify(data)).digest("hex"));
}
exports.sha512 = sha512;
function computeHmac(algorithm, key, data) {
    if (!SupportedAlgorithm[algorithm]) {
        logger.throwError("unsupported algorithm " + algorithm, logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "hmac",
            algorithm: algorithm
        });
    }
    return "0x" + hash.hmac(hash[algorithm], bytes_1.arrayify(key)).update(bytes_1.arrayify(data)).digest("hex");
}
exports.computeHmac = computeHmac;
//# sourceMappingURL=browser.js.map