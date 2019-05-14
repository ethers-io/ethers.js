"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("@ethersproject/bytes");
var errors = __importStar(require("@ethersproject/errors"));
var shuffle_1 = require("./shuffle");
exports.shuffled = shuffle_1.shuffled;
var crypto = global.crypto || global.msCrypto;
if (!crypto || !crypto.getRandomValues) {
    errors.warn("WARNING: Missing strong random number source");
    crypto = {
        getRandomValues: function (buffer) {
            return errors.throwError("no secure random source avaialble", errors.UNSUPPORTED_OPERATION, {
                operation: "crypto.getRandomValues"
            });
        }
    };
}
function randomBytes(length) {
    if (length <= 0 || length > 1024 || parseInt(String(length)) != length) {
        errors.throwError("invalid length", errors.INVALID_ARGUMENT, {
            argument: "length",
            value: length
        });
    }
    var result = new Uint8Array(length);
    crypto.getRandomValues(result);
    return bytes_1.arrayify(result);
}
exports.randomBytes = randomBytes;
;
