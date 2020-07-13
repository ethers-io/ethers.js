"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("@ethersproject/bytes");
var strings_1 = require("@ethersproject/strings");
function looseArrayify(hexString) {
    if (typeof (hexString) === 'string' && hexString.substring(0, 2) !== '0x') {
        hexString = '0x' + hexString;
    }
    return bytes_1.arrayify(hexString);
}
exports.looseArrayify = looseArrayify;
function zpad(value, length) {
    value = String(value);
    while (value.length < length) {
        value = '0' + value;
    }
    return value;
}
exports.zpad = zpad;
function getPassword(password) {
    if (typeof (password) === 'string') {
        return strings_1.toUtf8Bytes(password, strings_1.UnicodeNormalizationForm.NFKC);
    }
    return bytes_1.arrayify(password);
}
exports.getPassword = getPassword;
function searchPath(object, path) {
    var currentChild = object;
    var comps = path.toLowerCase().split('/');
    for (var i = 0; i < comps.length; i++) {
        // Search for a child object with a case-insensitive matching key
        var matchingChild = null;
        for (var key in currentChild) {
            if (key.toLowerCase() === comps[i]) {
                matchingChild = currentChild[key];
                break;
            }
        }
        // Didn't find one. :'(
        if (matchingChild === null) {
            return null;
        }
        // Now check this child...
        currentChild = matchingChild;
    }
    return currentChild;
}
exports.searchPath = searchPath;
//# sourceMappingURL=utils.js.map