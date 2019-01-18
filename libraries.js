"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var scrypt_js_1 = __importDefault(require("scrypt-js"));
var _pbkdf2 = crypto_1.pbkdf2;
var _scrypt = scrypt_js_1.default;
exports.setPbkdf2 = function (pbkdf2Fn) {
    _pbkdf2 = pbkdf2Fn;
};
exports.setScrypt = function (scryptFn) {
    _scrypt = scryptFn;
};
var libraries = {
    get pbkdf2() {
        return _pbkdf2;
    },
    get scrypt() {
        return _scrypt;
    }
};
exports.default = libraries;
