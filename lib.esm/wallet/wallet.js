import { SigningKey } from "../crypto/index.js";
import { assertArgument } from "../utils/index.js";
import { BaseWallet } from "./base-wallet.js";
import { HDNodeWallet } from "./hdwallet.js";
import { decryptCrowdsaleJson, isCrowdsaleJson } from "./json-crowdsale.js";
import { decryptKeystoreJson, decryptKeystoreJsonSync, isKeystoreJson } from "./json-keystore.js";
import { Mnemonic } from "./mnemonic.js";
function stall(duration) {
    return new Promise((resolve) => { setTimeout(() => { resolve(); }, duration); });
}
export class Wallet extends BaseWallet {
    constructor(key, provider) {
        let signingKey = (typeof (key) === "string") ? new SigningKey(key) : key;
        super(signingKey, provider);
    }
    connect(provider) {
        return new Wallet(this.signingKey, provider);
    }
    static #fromAccount(account) {
        assertArgument(account, "invalid JSON wallet", "json", "[ REDACTED ]");
        if ("mnemonic" in account && account.mnemonic && account.mnemonic.locale === "en") {
            const mnemonic = Mnemonic.fromEntropy(account.mnemonic.entropy);
            const wallet = HDNodeWallet.fromMnemonic(mnemonic, account.mnemonic.path);
            if (wallet.address === account.address && wallet.privateKey === account.privateKey) {
                return wallet;
            }
            console.log("WARNING: JSON mismatch address/privateKey != mnemonic; fallback onto private key");
        }
        const wallet = new Wallet(account.privateKey);
        assertArgument(wallet.address === account.address, "address/privateKey mismatch", "json", "[ REDACTED ]");
        return wallet;
    }
    static async fromEncryptedJson(json, password, progress) {
        let account = null;
        if (isKeystoreJson(json)) {
            account = await decryptKeystoreJson(json, password, progress);
        }
        else if (isCrowdsaleJson(json)) {
            if (progress) {
                progress(0);
                await stall(0);
            }
            account = decryptCrowdsaleJson(json, password);
            if (progress) {
                progress(1);
                await stall(0);
            }
        }
        return Wallet.#fromAccount(account);
    }
    static fromEncryptedJsonSync(json, password) {
        let account = null;
        if (isKeystoreJson(json)) {
            account = decryptKeystoreJsonSync(json, password);
        }
        else if (isCrowdsaleJson(json)) {
            account = decryptCrowdsaleJson(json, password);
        }
        else {
            assertArgument(false, "invalid JSON wallet", "json", "[ REDACTED ]");
        }
        return Wallet.#fromAccount(account);
    }
    static createRandom(provider) {
        const wallet = HDNodeWallet.createRandom();
        if (provider) {
            return wallet.connect(provider);
        }
        return wallet;
    }
    static fromPhrase(phrase, provider) {
        const wallet = HDNodeWallet.fromPhrase(phrase);
        if (provider) {
            return wallet.connect(provider);
        }
        return wallet;
    }
}
//# sourceMappingURL=wallet.js.map