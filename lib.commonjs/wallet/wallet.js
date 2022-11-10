"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const index_js_1 = require("../crypto/index.js");
const index_js_2 = require("../utils/index.js");
const base_wallet_js_1 = require("./base-wallet.js");
const hdwallet_js_1 = require("./hdwallet.js");
const json_crowdsale_js_1 = require("./json-crowdsale.js");
const json_keystore_js_1 = require("./json-keystore.js");
const mnemonic_js_1 = require("./mnemonic.js");
function stall(duration) {
    return new Promise((resolve) => { setTimeout(() => { resolve(); }, duration); });
}
class Wallet extends base_wallet_js_1.BaseWallet {
    constructor(key, provider) {
        let signingKey = (typeof (key) === "string") ? new index_js_1.SigningKey(key) : key;
        super(signingKey, provider);
    }
    connect(provider) {
        return new Wallet(this.signingKey, provider);
    }
    static #fromAccount(account) {
        (0, index_js_2.assertArgument)(account, "invalid JSON wallet", "json", "[ REDACTED ]");
        if ("mnemonic" in account && account.mnemonic && account.mnemonic.locale === "en") {
            const mnemonic = mnemonic_js_1.Mnemonic.fromEntropy(account.mnemonic.entropy);
            const wallet = hdwallet_js_1.HDNodeWallet.fromMnemonic(mnemonic, account.mnemonic.path);
            if (wallet.address === account.address && wallet.privateKey === account.privateKey) {
                return wallet;
            }
            console.log("WARNING: JSON mismatch address/privateKey != mnemonic; fallback onto private key");
        }
        const wallet = new Wallet(account.privateKey);
        (0, index_js_2.assertArgument)(wallet.address === account.address, "address/privateKey mismatch", "json", "[ REDACTED ]");
        return wallet;
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
        return Wallet.#fromAccount(account);
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
            (0, index_js_2.assertArgument)(false, "invalid JSON wallet", "json", "[ REDACTED ]");
        }
        return Wallet.#fromAccount(account);
    }
    static createRandom(provider) {
        const wallet = hdwallet_js_1.HDNodeWallet.createRandom();
        if (provider) {
            return wallet.connect(provider);
        }
        return wallet;
    }
    static fromPhrase(phrase, provider) {
        const wallet = hdwallet_js_1.HDNodeWallet.fromPhrase(phrase);
        if (provider) {
            return wallet.connect(provider);
        }
        return wallet;
    }
}
exports.Wallet = Wallet;
//# sourceMappingURL=wallet.js.map