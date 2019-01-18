"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var scrypt_js_1 = __importDefault(require("scrypt-js"));
var _scrypt = scrypt_js_1.default;
exports.setScrypt = function (scryptFn) {
    _scrypt = scryptFn;
};
var libraries = {
    get scrypt() {
        return _scrypt;
    }
};
exports.default = libraries;
