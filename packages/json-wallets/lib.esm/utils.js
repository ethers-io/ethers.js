"use strict";
import { arrayify } from "@ethersproject/bytes";
import { toUtf8Bytes, UnicodeNormalizationForm } from '@ethersproject/strings';
export function looseArrayify(hexString) {
    if (typeof (hexString) === 'string' && hexString.substring(0, 2) !== '0x') {
        hexString = '0x' + hexString;
    }
    return arrayify(hexString);
}
export function zpad(value, length) {
    value = String(value);
    while (value.length < length) {
        value = '0' + value;
    }
    return value;
}
export function getPassword(password) {
    if (typeof (password) === 'string') {
        return toUtf8Bytes(password, UnicodeNormalizationForm.NFKC);
    }
    return arrayify(password);
}
export function searchPath(object, path) {
    let currentChild = object;
    const comps = path.toLowerCase().split('/');
    for (let i = 0; i < comps.length; i++) {
        // Search for a child object with a case-insensitive matching key
        let matchingChild = null;
        for (const key in currentChild) {
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
