"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var address_1 = require("./address");
function isCrowdsaleWallet(json) {
    try {
        var data = JSON.parse(json);
    }
    catch (error) {
        return false;
    }
    return (data.encseed && data.ethaddr);
}
exports.isCrowdsaleWallet = isCrowdsaleWallet;
function isSecretStorageWallet(json) {
    try {
        var data = JSON.parse(json);
    }
    catch (error) {
        return false;
    }
    if (!data.version || parseInt(data.version) !== data.version || parseInt(data.version) !== 3) {
        return false;
    }
    // @TODO: Put more checks to make sure it has kdf, iv and all that good stuff
    return true;
}
exports.isSecretStorageWallet = isSecretStorageWallet;
//export function isJsonWallet(json: string): boolean {
//    return (isSecretStorageWallet(json) || isCrowdsaleWallet(json));
//}
function getJsonWalletAddress(json) {
    if (isCrowdsaleWallet(json)) {
        try {
            return address_1.getAddress(JSON.parse(json).ethaddr);
        }
        catch (error) {
            return null;
        }
    }
    if (isSecretStorageWallet(json)) {
        try {
            return address_1.getAddress(JSON.parse(json).address);
        }
        catch (error) {
            return null;
        }
    }
    return null;
}
exports.getJsonWalletAddress = getJsonWalletAddress;
