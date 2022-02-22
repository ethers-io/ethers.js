"use strict";
import { arrayify, concat, hexDataLength, hexDataSlice, hexlify, isHexString, } from "@ethersproject/bytes";
import { _base16To36, _base36To16 } from "@ethersproject/bignumber";
import { keccak256 } from "@ethersproject/keccak256";
import { Logger } from "@hethers/logger";
import { version } from "./_version";
const logger = new Logger(version);
export function getAccountFromTransactionId(transactionId) {
    // TransactionId look like this: '0.0.99999999-9999999999-999999999'
    // or like this:                 '0.0.99999999@9999999999-999999999'
    if (!transactionId.match(/^\d+?\.\d+?\.\d+[-|@]\d+-\d+$/)) {
        logger.throwArgumentError("invalid transactionId", "transactionId", transactionId);
    }
    let splitSymbol = transactionId.indexOf('@') === -1 ? '-' : '@';
    const account = transactionId.split(splitSymbol);
    return account[0];
}
export function asAccountString(accountLike) {
    let parsedAccount = typeof (accountLike) === "string" ? parseAccount(accountLike) : accountLike;
    return `${parsedAccount.shard}.${parsedAccount.realm}.${parsedAccount.num}`;
}
export function getChecksumAddress(address) {
    if (!isHexString(address, 20)) {
        logger.throwArgumentError("invalid address", "address", address);
    }
    address = address.toLowerCase();
    const chars = address.substring(2).split("");
    const expanded = new Uint8Array(40);
    for (let i = 0; i < 40; i++) {
        expanded[i] = chars[i].charCodeAt(0);
    }
    const hashed = arrayify(keccak256(expanded));
    for (let i = 0; i < 40; i += 2) {
        if ((hashed[i >> 1] >> 4) >= 8) {
            chars[i] = chars[i].toUpperCase();
        }
        if ((hashed[i >> 1] & 0x0f) >= 8) {
            chars[i + 1] = chars[i + 1].toUpperCase();
        }
    }
    return "0x" + chars.join("");
}
// Shims for environments that are missing some required constants and functions
const MAX_SAFE_INTEGER = 0x1fffffffffffff;
function log10(x) {
    if (Math.log10) {
        return Math.log10(x);
    }
    return Math.log(x) / Math.LN10;
}
// See: https://en.wikipedia.org/wiki/International_Bank_Account_Number
// Create lookup table
const ibanLookup = {};
for (let i = 0; i < 10; i++) {
    ibanLookup[String(i)] = String(i);
}
for (let i = 0; i < 26; i++) {
    ibanLookup[String.fromCharCode(65 + i)] = String(10 + i);
}
// How many decimal digits can we process? (for 64-bit float, this is 15)
const safeDigits = Math.floor(log10(MAX_SAFE_INTEGER));
function ibanChecksum(address) {
    address = address.toUpperCase();
    address = address.substring(4) + address.substring(0, 2) + "00";
    let expanded = address.split("").map((c) => {
        return ibanLookup[c];
    }).join("");
    // Javascript can handle integers safely up to 15 (decimal) digits
    while (expanded.length >= safeDigits) {
        let block = expanded.substring(0, safeDigits);
        expanded = parseInt(block, 10) % 97 + expanded.substring(block.length);
    }
    let checksum = String(98 - (parseInt(expanded, 10) % 97));
    while (checksum.length < 2) {
        checksum = "0" + checksum;
    }
    return checksum;
}
export function getAddress(address) {
    let result = null;
    if (typeof (address) !== "string") {
        logger.throwArgumentError("invalid address", "address", address);
    }
    if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
        // Missing the 0x prefix
        if (address.substring(0, 2) !== "0x") {
            address = "0x" + address;
        }
        result = getChecksumAddress(address);
        // It is a checksummed address with a bad checksum
        if (address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && result !== address) {
            logger.throwArgumentError("bad address checksum", "address", address);
        }
        // Maybe ICAP? (we only support direct mode)
    }
    else if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
        // It is an ICAP address with a bad checksum
        if (address.substring(2, 4) !== ibanChecksum(address)) {
            logger.throwArgumentError("bad icap checksum", "address", address);
        }
        result = _base36To16(address.substring(4));
        while (result.length < 40) {
            result = "0" + result;
        }
        result = getChecksumAddress("0x" + result);
    }
    else {
        logger.throwArgumentError("invalid address", "address", address);
    }
    return result;
}
export function isAddress(address) {
    try {
        getAddress(address);
        return true;
    }
    catch (error) {
    }
    return false;
}
export function getIcapAddress(address) {
    let base36 = _base16To36(getAddress(address).substring(2)).toUpperCase();
    while (base36.length < 30) {
        base36 = "0" + base36;
    }
    return "XE" + ibanChecksum("XE00" + base36) + base36;
}
export function getCreate2Address(from, salt, initCodeHash) {
    if (hexDataLength(salt) !== 32) {
        logger.throwArgumentError("salt must be 32 bytes", "salt", salt);
    }
    if (hexDataLength(initCodeHash) !== 32) {
        logger.throwArgumentError("initCodeHash must be 32 bytes", "initCodeHash", initCodeHash);
    }
    return getAddress(hexDataSlice(keccak256(concat(["0xff", getAddress(from), salt, initCodeHash])), 12));
}
export function getAddressFromAccount(accountLike) {
    let parsedAccount = typeof (accountLike) === "string" ? parseAccount(accountLike) : accountLike;
    const buffer = new Uint8Array(20);
    const view = new DataView(buffer.buffer, 0, 20);
    view.setInt32(0, Number(parsedAccount.shard));
    view.setBigInt64(4, parsedAccount.realm);
    view.setBigInt64(12, parsedAccount.num);
    return hexlify(buffer);
}
export function getAccountFromAddress(address) {
    let buffer = arrayify(getAddress(address));
    const view = new DataView(buffer.buffer, 0, 20);
    return {
        shard: BigInt(view.getInt32(0)),
        realm: BigInt(view.getBigInt64(4)),
        num: BigInt(view.getBigInt64(12))
    };
}
export function parseAccount(account) {
    let result = null;
    if (typeof (account) !== "string") {
        logger.throwArgumentError("invalid account", "account", account);
    }
    if (account.match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
        let parsedAccount = account.split('.');
        result = {
            shard: BigInt(parsedAccount[0]),
            realm: BigInt(parsedAccount[1]),
            num: BigInt(parsedAccount[2])
        };
    }
    else if (isAddress(account)) {
        result = getAccountFromAddress(account);
    }
    else {
        logger.throwArgumentError("invalid account", "account", account);
    }
    return result;
}
//# sourceMappingURL=index.js.map