"use strict";
import { getJsonWalletAddress, isKeystoreWallet } from "./inspect";
import { decrypt as decryptKeystore, decryptSync as decryptKeystoreSync, encrypt as encryptKeystore } from "./keystore";
function decryptJsonWallet(json, password, progressCallback) {
    if (isKeystoreWallet(json)) {
        return decryptKeystore(json, password, progressCallback);
    }
    return Promise.reject(new Error("invalid JSON wallet"));
}
function decryptJsonWalletSync(json, password) {
    if (isKeystoreWallet(json)) {
        return decryptKeystoreSync(json, password);
    }
    throw new Error("invalid JSON wallet");
}
export { decryptKeystore, decryptKeystoreSync, encryptKeystore, isKeystoreWallet, getJsonWalletAddress, decryptJsonWallet, decryptJsonWalletSync, };
//# sourceMappingURL=index.js.map