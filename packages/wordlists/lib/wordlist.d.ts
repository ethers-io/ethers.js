export declare abstract class Wordlist {
    locale: string;
    constructor(locale: string);
    split(mnemonic: string): Array<string>;
    join(words: Array<string>): string;
    abstract getWord(index: number): string;
    abstract getWordIndex(word: string): number;
}
//# sourceMappingURL=wordlist.d.ts.map