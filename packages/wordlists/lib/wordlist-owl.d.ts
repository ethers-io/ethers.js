import { Wordlist } from "./wordlist.js";
export declare class WordlistOwl extends Wordlist {
    #private;
    constructor(locale: string, data: string, checksum: string);
    get _data(): string;
    _decodeWords(): Array<string>;
    getWord(index: number): string;
    getWordIndex(word: string): number;
}
//# sourceMappingURL=wordlist-owl.d.ts.map