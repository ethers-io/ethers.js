import { Wordlist } from "./wordlist.js";
declare class LangZh extends Wordlist {
    constructor(country: string);
    getWord(index: number): string;
    getWordIndex(word: string): number;
    split(mnemonic: string): Array<string>;
}
export declare const langZhCn: LangZh;
export declare const langZhTw: LangZh;
export {};
//# sourceMappingURL=lang-zh.d.ts.map