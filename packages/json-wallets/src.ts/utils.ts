"use strict";

import { arrayify, Bytes } from "@ethersproject/bytes";
//import { Description } from "@ethersproject/properties";
import { toUtf8Bytes, UnicodeNormalizationForm } from '@ethersproject/strings';

/*
export class Account extends Description implements ExternallyOwnedAccount {
    readonly address: string;
    readonly privateKey: string;
    readonly mnemonic?: string;
    readonly path?: string;

//    static isAccount(value: any): value is Account {
//        return Description._isType(value);
//    }
}
//defineReadOnly(Account, "name", "Account");
*/

export function looseArrayify(hexString: string): Uint8Array {
    if (typeof(hexString) === 'string' && hexString.substring(0, 2) !== '0x') {
        hexString = '0x' + hexString;
    }
    return arrayify(hexString);
}

export function zpad(value: String | number, length: number): String {
    value = String(value);
    while (value.length < length) { value = '0' + value; }
    return value;
}

export function getPassword(password: Bytes | string): Uint8Array {
    if (typeof(password) === 'string') {
        return toUtf8Bytes(password, UnicodeNormalizationForm.NFKC);
    }
    return arrayify(password);
}

export function searchPath(object: any, path: string): string {
    let currentChild = object;

    let comps = path.toLowerCase().split('/');
    for (let i = 0; i < comps.length; i++) {

        // Search for a child object with a case-insensitive matching key
        let matchingChild = null;
        for (let key in currentChild) {
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
