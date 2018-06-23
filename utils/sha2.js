'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var hash_js_1 = __importDefault(require("hash.js"));
var bytes_1 = require("./bytes");
function sha256(data) {
    return '0x' + (hash_js_1.default.sha256().update(bytes_1.arrayify(data)).digest('hex'));
}
exports.sha256 = sha256;
function sha512(data) {
    return '0x' + (hash_js_1.default.sha512().update(bytes_1.arrayify(data)).digest('hex'));
}
exports.sha512 = sha512;
