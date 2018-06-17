'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _hash = __importStar(require("hash.js"));
var bytes_1 = require("./bytes");
var _hmac = _hash['hmac'];
var _sha256 = _hash['sha256'];
var _sha512 = _hash['sha512'];
// @TODO: Make this use create-hmac in node
function createSha256Hmac(key) {
    if (!key['buffer']) {
        key = bytes_1.arrayify(key);
    }
    return _hmac(_sha256, key);
}
exports.createSha256Hmac = createSha256Hmac;
function createSha512Hmac(key) {
    if (!key['buffer']) {
        key = bytes_1.arrayify(key);
    }
    return _hmac(_sha512, key);
}
exports.createSha512Hmac = createSha512Hmac;
