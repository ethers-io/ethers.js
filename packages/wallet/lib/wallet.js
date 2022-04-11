var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Wallet_mnemonic;
import { isHexString } from "@ethersproject/bytes";
import { randomBytes } from "@ethersproject/crypto";
import { SigningKey } from "@ethersproject/signing-key";
import { computeAddress } from "./address.js";
import { BaseWallet } from "./base-wallet.js";
import { HDNodeWallet } from "./hdwallet.js";
import { decryptCrowdsaleJson, isCrowdsaleJson } from "./json-crowdsale.js";
import { decryptKeystoreJson, decryptKeystoreJsonSync, isKeystoreJson } from "./json-keystore.js";
import { logger } from "./logger.js";
import { Mnemonic } from "./mnemonic.js";
function tryWallet(value) {
    try {
        if (!value || !value.signingKey) {
            return null;
        }
        const key = trySigningKey(value.signingKey);
        if (key == null || computeAddress(key.publicKey) !== value.address) {
            return null;
        }
        if (value.mnemonic) {
            const wallet = HDNodeWallet.fromMnemonic(value.mnemonic);
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
        return HDNodeWallet.fromPhrase(value.phrase, value.password, null, value.wordlist);
    }
    catch (error) {
        console.log(error);
    }
    return null;
}
function trySigningKey(value) {
    try {
        if (!value || !isHexString(value.privateKey, 32)) {
            return null;
        }
        const key = value.privateKey;
        if (SigningKey.computePublicKey(key) !== value.publicKey) {
            return null;
        }
        return new SigningKey(key);
    }
    catch (e) {
        console.log(e);
    }
    return null;
}
function stall(duration) {
    return new Promise((resolve) => { setTimeout(() => { resolve(); }, duration); });
}
export class Wallet extends BaseWallet {
    constructor(key, provider) {
        let signingKey = null;
        let mnemonic = null;
        // A normal private key
        if (typeof (key) === "string") {
            signingKey = new SigningKey(key);
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
            logger.throwArgumentError("invalid key", "key", "[ REDACTED ]");
        }
        super(signingKey, provider);
        _Wallet_mnemonic.set(this, void 0);
        __classPrivateFieldSet(this, _Wallet_mnemonic, mnemonic, "f");
    }
    // Store this in a getter to reduce visibility in console.log
    get mnemonic() { return __classPrivateFieldGet(this, _Wallet_mnemonic, "f"); }
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
        else {
            return logger.throwArgumentError("invalid JSON wallet", "json", "[ REDACTED ]");
        }
        const wallet = new Wallet(account.privateKey);
        if (wallet.address !== account.address) {
            logger.throwArgumentError("address/privateKey mismatch", "json", "[ REDACTED ]");
        }
        // @TODO: mnemonic
        return wallet;
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
            return logger.throwArgumentError("invalid JSON wallet", "json", "[ REDACTED ]");
        }
        const wallet = new Wallet(account.privateKey);
        if (wallet.address !== account.address) {
            logger.throwArgumentError("address/privateKey mismatch", "json", "[ REDACTED ]");
        }
        // @TODO: mnemonic
        return wallet;
    }
    static createRandom(provider, password, wordlist) {
        return new Wallet(Mnemonic.fromEntropy(randomBytes(16), password, wordlist), provider);
    }
    static fromMnemonic(mnemonic, provider) {
        return new Wallet(mnemonic, provider);
    }
    static fromPhrase(phrase, provider, password = "", wordlist) {
        return new Wallet(Mnemonic.fromPhrase(phrase, password, wordlist), provider);
    }
}
_Wallet_mnemonic = new WeakMap();
//# sourceMappingURL=wallet.js.map