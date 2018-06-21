export declare abstract class Wordlist {
    locale: string;
    constructor(locale: string);
    abstract getWord(index: number): string;
    abstract getWordIndex(word: string): number;
    split(mnemonic: string): Array<string>;
    join(words: Array<string>): string;
}
export declare function register(lang: any): void;
