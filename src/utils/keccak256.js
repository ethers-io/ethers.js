'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var sha3 = require("js-sha3");
var convert_1 = require("./convert");
function keccak256(data) {
    return '0x' + sha3.keccak_256(convert_1.arrayify(data));
}
exports.keccak256 = keccak256;
