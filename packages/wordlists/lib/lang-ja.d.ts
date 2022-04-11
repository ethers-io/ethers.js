import { Wordlist } from "./wordlist.js";
declare class LangJa extends Wordlist {
    constructor();
    getWord(index: number): string;
    getWordIndex(word: string): number;
    split(mnemonic: string): Array<string>;
    join(words: Array<string>): string;
}
export declare const langJa: LangJa;
export {};
//# sourceMappingURL=lang-ja.d.ts.map