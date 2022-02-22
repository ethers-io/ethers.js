"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJsonWalletAddress = exports.isKeystoreWallet = void 0;
var address_1 = require("@hethers/address");
function isKeystoreWallet(json) {
    var data = null;
    try {
        data = JSON.parse(json);
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
exports.isKeystoreWallet = isKeystoreWallet;
function getJsonWalletAddress(json) {
    if (isKeystoreWallet(json)) {
        try {
            return (0, address_1.getAddress)(JSON.parse(json).address);
        }
        catch (error) {
            return null;
        }
    }
    return null;
}
exports.getJsonWalletAddress = getJsonWalletAddress;
//# sourceMappingURL=inspect.js.map