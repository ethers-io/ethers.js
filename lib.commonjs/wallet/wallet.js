"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const index_js_1 = require("../crypto/index.js");
const index_js_2 = require("../transaction/index.js");
const index_js_3 = require("../utils/index.js");
const base_wallet_js_1 = require("./base-wallet.js");
const hdwallet_js_1 = require("./hdwallet.js");
const json_crowdsale_js_1 = require("./json-crowdsale.js");
const json_keystore_js_1 = require("./json-keystore.js");
const mnemonic_js_1 = require("./mnemonic.js");
function tryWallet(value) {
    try {
        if (!value || !value.signingKey) {
            return null;
        }
        const key = trySigningKey(value.signingKey);
        if (key == null || (0, index_js_2.computeAddress)(key.publicKey) !== value.address) {
            return null;
        }
        if (value.mnemonic) {
            const wallet = hdwallet_js_1.HDNodeWallet.fromMnemonic(value.mnemonic);
            if (wallet.privateKey !== key.privateKey) {
                return null;
            }
        }
        return value;
    }
    catch (e) {
        console.log(e);
    }
    return null;
}
// Try using value as mnemonic to derive the defaultPath HDodeWallet
function tryMnemonic(value) {
    try {
        if (value == null || typeof (value.phrase) !== "string" ||
            typeof (value.password) !== "string" ||
            value.wordlist == null) {
            return null;
        }
        return hdwallet_js_1.HDNodeWallet.fromPhrase(value.phrase, value.password, null, value.wordlist);
    }
    catch (error) {
        console.log(error);
    }
    return null;
}
function trySigningKey(value) {
    try {
        if (!value || !(0, index_js_3.isHexString)(value.privateKey, 32)) {
            return null;
        }
        const key = value.privateKey;
        if (index_js_1.SigningKey.computePublicKey(key) !== value.publicKey) {
            return null;
        }
        return new index_js_1.SigningKey(key);
    }
    catch (e) {
        console.log(e);
    }
    return null;
}
function stall(duration) {
    return new Promise((resolve) => { setTimeout(() => { resolve(); }, duration); });
}
class Wallet extends base_wallet_js_1.BaseWallet {
    #mnemonic;
    constructor(key, provider) {
        let signingKey = null;
        let mnemonic = null;
        // A normal private key
        if (typeof (key) === "string") {
            signingKey = new index_js_1.SigningKey(key);
        }
        // Try Wallet
        if (signingKey == null) {
            const wallet = tryWallet(key);
            if (wallet) {
                signingKey = wallet.signingKey;
                mnemonic = wallet.mnemonic || null;
            }
        }
        // Try Mnemonic, with the defaultPath wallet
        if (signingKey == null) {
            const wallet = tryMnemonic(key);
            if (wallet) {
                signingKey = wallet.signingKey;
                mnemonic = wallet.mnemonic || null;
            }
        }
        // A signing key
        if (signingKey == null) {
            signingKey = trySigningKey(key);
        }
        if (signingKey == null) {
            index_js_3.logger.throwArgumentError("invalid key", "key", "[ REDACTED ]");
        }
        super(signingKey, provider);
        this.#mnemonic = mnemonic;
    }
    // Store this in a getter to reduce visibility in console.log
    get mnemonic() { return this.#mnemonic; }
    connect(provider) {
        return new Wallet(this, provider);
    }
    async encrypt(password, options, progressCallback) {
        throw new Error("TODO");
    }
    encryptSync(password, options) {
        throw new Error("TODO");
    }
    static async fromEncryptedJson(json, password, progress) {
        let account = null;
        if ((0, json_keystore_js_1.isKeystoreJson)(json)) {
            account = await (0, json_keystore_js_1.decryptKeystoreJson)(json, password, progress);
        }
        else if ((0, json_crowdsale_js_1.isCrowdsaleJson)(json)) {
            if (progress) {
                progress(0);
                await stall(0);
            }
            account = (0, json_crowdsale_js_1.decryptCrowdsaleJson)(json, password);
            if (progress) {
                progress(1);
                await stall(0);
            }
        }
        else {
            return index_js_3.logger.throwArgumentError("invalid JSON wallet", "json", "[ REDACTED ]");
        }
        const wallet = new Wallet(account.privateKey);
        if (wallet.address !== account.address) {
            index_js_3.logger.throwArgumentError("address/privateKey mismatch", "json", "[ REDACTED ]");
        }
        // @TODO: mnemonic
        return wallet;
    }
    static fromEncryptedJsonSync(json, password) {
        let account = null;
        if ((0, json_keystore_js_1.isKeystoreJson)(json)) {
            account = (0, json_keystore_js_1.decryptKeystoreJsonSync)(json, password);
        }
        else if ((0, json_crowdsale_js_1.isCrowdsaleJson)(json)) {
            account = (0, json_crowdsale_js_1.decryptCrowdsaleJson)(json, password);
        }
        else {
            return index_js_3.logger.throwArgumentError("invalid JSON wallet", "json", "[ REDACTED ]");
        }
        const wallet = new Wallet(account.privateKey);
        if (wallet.address !== account.address) {
            index_js_3.logger.throwArgumentError("address/privateKey mismatch", "json", "[ REDACTED ]");
        }
        // @TODO: mnemonic
        return wallet;
    }
    static createRandom(provider, password, wordlist) {
        return new Wallet(mnemonic_js_1.Mnemonic.fromEntropy((0, index_js_1.randomBytes)(16), password, wordlist), provider);
    }
    static fromMnemonic(mnemonic, provider) {
        return new Wallet(mnemonic, provider);
    }
    static fromPhrase(phrase, provider, password = "", wordlist) {
        return new Wallet(mnemonic_js_1.Mnemonic.fromPhrase(phrase, password, wordlist), provider);
    }
}
exports.Wallet = Wallet;
//# sourceMappingURL=wallet.js.map