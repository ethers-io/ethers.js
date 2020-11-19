"use strict";
import { ethers } from "ethers";
import scrypt from "scrypt-js";
import { version } from "./_version";
const logger = new ethers.utils.Logger(version);
let warned = false;
export class BrainWallet extends ethers.Wallet {
    static _generate(username, password, legacy, progressCallback) {
        if (!warned) {
            logger.warn("Warning: using Brain Wallets should be considered insecure (this warning will not be repeated)");
            warned = true;
        }
        let usernameBytes = null;
        let passwordBytes = null;
        if (typeof (username) === 'string') {
            logger.checkNormalize();
            usernameBytes = ethers.utils.toUtf8Bytes(username.normalize('NFKC'));
        }
        else {
            usernameBytes = ethers.utils.arrayify(username);
        }
        if (typeof (password) === 'string') {
            logger.checkNormalize();
            passwordBytes = ethers.utils.toUtf8Bytes(password.normalize('NFKC'));
        }
        else {
            passwordBytes = ethers.utils.arrayify(password);
        }
        return scrypt.scrypt(passwordBytes, usernameBytes, (1 << 18), 8, 1, 32, progressCallback).then((key) => {
            if (legacy) {
                return new BrainWallet(key);
            }
            const mnemonic = ethers.utils.entropyToMnemonic(ethers.utils.arrayify(key).slice(0, 16));
            return new BrainWallet(ethers.Wallet.fromMnemonic(mnemonic));
        });
    }
    static generate(username, password, progressCallback) {
        return BrainWallet._generate(username, password, false, progressCallback);
    }
    static generateLegacy(username, password, progressCallback) {
        return BrainWallet._generate(username, password, true, progressCallback);
    }
}
//# sourceMappingURL=brain-wallet.js.map