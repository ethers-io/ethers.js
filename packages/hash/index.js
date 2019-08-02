"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("@ethersproject/bytes");
var strings_1 = require("@ethersproject/strings");
var keccak256_1 = require("@ethersproject/keccak256");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
///////////////////////////////
var Zeros = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
var Partition = new RegExp("^((.*)\\.)?([^.]+)$");
function isValidName(name) {
    try {
        var comps = name.split(".");
        for (var i = 0; i < comps.length; i++) {
            if (strings_1.nameprep(comps[i]).length === 0) {
                throw new Error("empty");
            }
        }
        return true;
    }
    catch (error) { }
    return false;
}
exports.isValidName = isValidName;
function namehash(name) {
    if (typeof (name) !== "string") {
        logger.throwArgumentError("invalid address - " + String(name), "name", name);
    }
    var result = Zeros;
    while (name.length) {
        var partition = name.match(Partition);
        var label = strings_1.toUtf8Bytes(strings_1.nameprep(partition[3]));
        result = keccak256_1.keccak256(bytes_1.concat([result, keccak256_1.keccak256(label)]));
        name = partition[2] || "";
    }
    return bytes_1.hexlify(result);
}
exports.namehash = namehash;
function id(text) {
    return keccak256_1.keccak256(strings_1.toUtf8Bytes(text));
}
exports.id = id;
exports.messagePrefix = "\x19Ethereum Signed Message:\n";
function hashMessage(message) {
    if (typeof (message) === "string") {
        message = strings_1.toUtf8Bytes(message);
    }
    return keccak256_1.keccak256(bytes_1.concat([
        strings_1.toUtf8Bytes(exports.messagePrefix),
        strings_1.toUtf8Bytes(String(message.length)),
        message
    ]));
}
exports.hashMessage = hashMessage;
