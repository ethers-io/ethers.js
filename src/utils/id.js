'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var keccak256_1 = require("./keccak256");
var utf8_1 = require("./utf8");
function id(text) {
    return keccak256_1.keccak256(utf8_1.toUtf8Bytes(text));
}
exports.id = id;
