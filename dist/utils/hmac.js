'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var bytes_1 = require("./bytes");
var errors = __importStar(require("./errors"));
var supportedAlgorithms = { sha256: true, sha512: true };
function computeHmac(algorithm, key, data) {
    if (!supportedAlgorithms[algorithm]) {
        errors.throwError('unsupported algorithm ' + algorithm, errors.UNSUPPORTED_OPERATION, { operation: 'hmac', algorithm: algorithm });
    }
    return bytes_1.arrayify(crypto_1.createHmac(algorithm, new Buffer(bytes_1.arrayify(key))).update(new Buffer(bytes_1.arrayify(data))).digest());
}
exports.computeHmac = computeHmac;
