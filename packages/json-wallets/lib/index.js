"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crowdsale_1 = require("./crowdsale");
exports.decryptCrowdsale = crowdsale_1.decrypt;
var inspect_1 = require("./inspect");
exports.getJsonWalletAddress = inspect_1.getJsonWalletAddress;
exports.isCrowdsaleWallet = inspect_1.isCrowdsaleWallet;
exports.isKeystoreWallet = inspect_1.isKeystoreWallet;
var keystore_1 = require("./keystore");
exports.decryptKeystore = keystore_1.decrypt;
exports.decryptKeystoreSync = keystore_1.decryptSync;
exports.encryptKeystore = keystore_1.encrypt;
function decryptJsonWallet(json, password, progressCallback) {
    if (inspect_1.isCrowdsaleWallet(json)) {
        if (progressCallback) {
            progressCallback(0);
        }
        var account = crowdsale_1.decrypt(json, password);
        if (progressCallback) {
            progressCallback(1);
        }
        return Promise.resolve(account);
    }
    if (inspect_1.isKeystoreWallet(json)) {
        return keystore_1.decrypt(json, password, progressCallback);
    }
    return Promise.reject(new Error("invalid JSON wallet"));
}
exports.decryptJsonWallet = decryptJsonWallet;
function decryptJsonWalletSync(json, password) {
    if (inspect_1.isCrowdsaleWallet(json)) {
        return crowdsale_1.decrypt(json, password);
    }
    if (inspect_1.isKeystoreWallet(json)) {
        return keystore_1.decryptSync(json, password);
    }
    throw new Error("invalid JSON wallet");
}
exports.decryptJsonWalletSync = decryptJsonWalletSync;
//# sourceMappingURL=index.js.map