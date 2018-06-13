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
var convert_1 = require("./convert");
var _sha256 = _hash['sha256'];
var _sha512 = _hash['sha512'];
function sha256(data) {
    return '0x' + (_sha256().update(convert_1.arrayify(data)).digest('hex'));
}
exports.sha256 = sha256;
function sha512(data) {
    return '0x' + (_sha512().update(convert_1.arrayify(data)).digest('hex'));
}
exports.sha512 = sha512;
