import { SigningKey } from "../crypto/index.js";
import { assertArgument } from "../utils/index.js";

import { BaseWallet } from "./base-wallet.js";
import { HDNodeWallet } from "./hdwallet.js";
import { decryptCrowdsaleJson, isCrowdsaleJson  } from "./json-crowdsale.js";
import {
    decryptKeystoreJson, decryptKeystoreJsonSync,
    isKeystoreJson
} from "./json-keystore.js";
import { Mnemonic } from "./mnemonic.js";

import type { ProgressCallback } from "../crypto/index.js";
import type { Provider } from "../providers/index.js";

import type { CrowdsaleAccount } from "./json-crowdsale.js";
import type { KeystoreAccount } from "./json-keystore.js";


function stall(duration: number): Promise<void> {
    return new Promise((resolve) => { setTimeout(() => { resolve(); }, duration); });
}

export class Wallet extends BaseWallet {

    constructor(key: string | SigningKey, provider?: null | Provider) {
        let signingKey = (typeof(key) === "string") ? new SigningKey(key): key;
        super(signingKey, provider);
    }

    connect(provider: null | Provider): Wallet {
        return new Wallet(this.signingKey, provider);
    }

    static #fromAccount(account: null | CrowdsaleAccount | KeystoreAccount): HDNodeWallet | Wallet {
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

        assertArgument(wallet.address === account.address,
            "address/privateKey mismatch", "json", "[ REDACTED ]");

        return wallet;
    }

    static async fromEncryptedJson(json: string, password: Uint8Array | string, progress?: ProgressCallback): Promise<HDNodeWallet | Wallet> {
        let account: null | CrowdsaleAccount | KeystoreAccount = null;
        if (isKeystoreJson(json)) {
            account = await decryptKeystoreJson(json, password, progress);

        } else if (isCrowdsaleJson(json)) {
            if (progress) { progress(0); await stall(0); }
            account = decryptCrowdsaleJson(json, password);
            if (progress) { progress(1); await stall(0); }

        }

        return Wallet.#fromAccount(account);
    }

    static fromEncryptedJsonSync(json: string, password: Uint8Array | string): Wallet {
        let account: null | CrowdsaleAccount | KeystoreAccount = null;
        if (isKeystoreJson(json)) {
            account = decryptKeystoreJsonSync(json, password);
        } else if (isCrowdsaleJson(json)) {
            account = decryptCrowdsaleJson(json, password);
        } else {
            assertArgument(false, "invalid JSON wallet", "json", "[ REDACTED ]");
        }

        return Wallet.#fromAccount(account);
    }

    static createRandom(provider?: null | Provider): HDNodeWallet {
        const wallet = HDNodeWallet.createRandom();
        if (provider) { return wallet.connect(provider); }
        return wallet;
    }

    static fromPhrase(phrase: string, provider?: Provider): HDNodeWallet {
        const wallet = HDNodeWallet.fromPhrase(phrase);
        if (provider) { return wallet.connect(provider); }
        return wallet;
    }
}
