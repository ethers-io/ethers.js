import { SigningKey } from "../crypto/index.js";
import { BaseWallet } from "./base-wallet.js";
import { Mnemonic } from "./mnemonic.js";
import type { ProgressCallback } from "../crypto/index.js";
import type { Provider } from "../providers/index.js";
import type { Wordlist } from "../wordlists/index.js";
export declare class Wallet extends BaseWallet {
    #private;
    constructor(key: string | Mnemonic | SigningKey | BaseWallet, provider?: null | Provider);
    get mnemonic(): null | Mnemonic;
    connect(provider: null | Provider): Wallet;
    encrypt(password: Uint8Array | string, options?: any, progressCallback?: ProgressCallback): Promise<string>;
    encryptSync(password: Uint8Array | string, options?: any): Promise<string>;
    static fromEncryptedJson(json: string, password: Uint8Array | string, progress?: ProgressCallback): Promise<Wallet>;
    static fromEncryptedJsonSync(json: string, password: Uint8Array | string): Wallet;
    static createRandom(provider?: null | Provider, password?: null | string, wordlist?: null | Wordlist): Wallet;
    static fromMnemonic(mnemonic: Mnemonic, provider?: null | Provider): Wallet;
    static fromPhrase(phrase: string, provider?: null | Provider, password?: string, wordlist?: Wordlist): Wallet;
}
//# sourceMappingURL=wallet.d.ts.map