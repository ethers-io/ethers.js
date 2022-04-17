import { isHexString } from "@ethersproject/bytes";
import { randomBytes } from "@ethersproject/crypto";
import { SigningKey } from "@ethersproject/signing-key";
import { computeAddress } from "@ethersproject/transaction";

import { BaseWallet } from "./base-wallet.js";
import { HDNodeWallet } from "./hdwallet.js";
import { decryptCrowdsaleJson, isCrowdsaleJson  } from "./json-crowdsale.js";
import {
    decryptKeystoreJson, decryptKeystoreJsonSync, isKeystoreJson
} from "./json-keystore.js";
import { logger } from "./logger.js";
import { Mnemonic } from "./mnemonic.js";

import type { ProgressCallback } from "@ethersproject/crypto";
import type { Provider } from "@ethersproject/providers";
import type { Wordlist } from "@ethersproject/wordlists";

import type { CrowdsaleAccount } from "./json-crowdsale.js";
import type { KeystoreAccount } from "./json-keystore.js";

function tryWallet(value: any): null | Wallet {
    try {
        if (!value || !value.signingKey) { return null; }
        const key = trySigningKey(value.signingKey);
        if (key == null || computeAddress(key.publicKey) !== value.address) { return null; }
        if (value.mnemonic) {
            const wallet = HDNodeWallet.fromMnemonic(value.mnemonic);
            if (wallet.privateKey !== key.privateKey) { return null; }
        }
        return value;
    } catch (e) { console.log(e); }
    return null;
}

// Try using value as mnemonic to derive the defaultPath HDodeWallet
function tryMnemonic(value: any): null | HDNodeWallet {
    try {
        if (value == null || typeof(value.phrase) !== "string" ||
            typeof(value.password) !== "string" ||
            value.wordlist == null) { return null; }
        return HDNodeWallet.fromPhrase(value.phrase, value.password, null, value.wordlist);
    } catch (error) { console.log(error); }
    return null;
}

function trySigningKey(value: any): null | SigningKey {
    try {
        if (!value || !isHexString(value.privateKey, 32)) { return null; }

        const key = value.privateKey;
        if (SigningKey.computePublicKey(key) !== value.publicKey) { return null; }
        return new SigningKey(key);
    } catch (e) { console.log(e); }
    return null;
}

function stall(duration: number): Promise<void> {
    return new Promise((resolve) => { setTimeout(() => { resolve(); }, duration); });
}

export class Wallet extends BaseWallet {
    readonly #mnemonic: null | Mnemonic;

    constructor(key: string | Mnemonic | SigningKey | BaseWallet, provider?: null | Provider) {
        let signingKey: null | SigningKey = null;
        let mnemonic: null | Mnemonic = null;

        // A normal private key
        if (typeof(key) === "string") { signingKey = new SigningKey(key); }

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
        if (signingKey == null) { signingKey = trySigningKey(key); }

        if (signingKey == null) {
           logger.throwArgumentError("invalid key", "key", "[ REDACTED ]");
        }

        super(signingKey as SigningKey, provider);
        this.#mnemonic = mnemonic;
    }

    // Store this in a getter to reduce visibility in console.log
    get mnemonic(): null | Mnemonic { return this.#mnemonic; }

    connect(provider: null | Provider): Wallet {
        return new Wallet(this, provider);
    }

    async encrypt(password: Uint8Array | string, options?: any, progressCallback?: ProgressCallback): Promise<string> {
        throw new Error("TODO");
    }

    encryptSync(password: Uint8Array | string, options?: any): Promise<string> {
        throw new Error("TODO");
    }

    static async fromEncryptedJson(json: string, password: Uint8Array | string, progress?: ProgressCallback): Promise<Wallet> {
        let account: null | CrowdsaleAccount | KeystoreAccount = null;
        if (isKeystoreJson(json)) {
            account = await decryptKeystoreJson(json, password, progress);

        } else if (isCrowdsaleJson(json)) {
            if (progress) { progress(0); await stall(0); }
            account = decryptCrowdsaleJson(json, password);
            if (progress) { progress(1); await stall(0); }

        } else {
            return logger.throwArgumentError("invalid JSON wallet", "json", "[ REDACTED ]");
        }

        const wallet = new Wallet(account.privateKey);
        if (wallet.address !== account.address) {
            logger.throwArgumentError("address/privateKey mismatch", "json", "[ REDACTED ]");
        }
        // @TODO: mnemonic
        return wallet;
    }

    static fromEncryptedJsonSync(json: string, password: Uint8Array | string): Wallet {
        let account: null | CrowdsaleAccount | KeystoreAccount = null;
        if (isKeystoreJson(json)) {
            account = decryptKeystoreJsonSync(json, password);
        } else if (isCrowdsaleJson(json)) {
            account = decryptCrowdsaleJson(json, password);
        } else {
            return logger.throwArgumentError("invalid JSON wallet", "json", "[ REDACTED ]");
        }

        const wallet = new Wallet(account.privateKey);
        if (wallet.address !== account.address) {
            logger.throwArgumentError("address/privateKey mismatch", "json", "[ REDACTED ]");
        }
        // @TODO: mnemonic
        return wallet;
    }

    static createRandom(provider?: null | Provider, password?: null | string, wordlist?: null | Wordlist): Wallet {
        return new Wallet(Mnemonic.fromEntropy(randomBytes(16), password, wordlist), provider);
    }

    static fromMnemonic(mnemonic: Mnemonic, provider?: null | Provider): Wallet {
        return new Wallet(mnemonic, provider);
    }

    static fromPhrase(phrase: string, provider?: null | Provider, password = "", wordlist?: Wordlist): Wallet {
        return new Wallet(Mnemonic.fromPhrase(phrase, password, wordlist), provider);
    }
}
