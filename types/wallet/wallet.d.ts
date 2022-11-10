import { SigningKey } from "../crypto/index.js";
import { BaseWallet } from "./base-wallet.js";
import { HDNodeWallet } from "./hdwallet.js";
import type { ProgressCallback } from "../crypto/index.js";
import type { Provider } from "../providers/index.js";
export declare class Wallet extends BaseWallet {
    #private;
    constructor(key: string | SigningKey, provider?: null | Provider);
    connect(provider: null | Provider): Wallet;
    static fromEncryptedJson(json: string, password: Uint8Array | string, progress?: ProgressCallback): Promise<HDNodeWallet | Wallet>;
    static fromEncryptedJsonSync(json: string, password: Uint8Array | string): Wallet;
    static createRandom(provider?: null | Provider): HDNodeWallet;
    static fromPhrase(phrase: string, provider?: Provider): HDNodeWallet;
}
//# sourceMappingURL=wallet.d.ts.map