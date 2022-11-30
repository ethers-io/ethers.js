import type { BytesLike } from "../utils/index.js";
import type { Wordlist } from "../wordlists/index.js";
export declare class Mnemonic {
    readonly phrase: string;
    readonly password: string;
    readonly wordlist: Wordlist;
    readonly entropy: string;
    /**
     *  @private
     */
    constructor(guard: any, entropy: string, phrase: string, password?: null | string, wordlist?: null | Wordlist);
    computeSeed(): string;
    static fromPhrase(phrase: string, password?: null | string, wordlist?: null | Wordlist): Mnemonic;
    static fromEntropy(_entropy: BytesLike, password?: null | string, wordlist?: null | Wordlist): Mnemonic;
    static entropyToPhrase(_entropy: BytesLike, wordlist?: null | Wordlist): string;
    static phraseToEntropy(phrase: string, wordlist?: null | Wordlist): string;
    static isValidMnemonic(phrase: string, wordlist?: null | Wordlist): boolean;
}
//# sourceMappingURL=mnemonic.d.ts.map