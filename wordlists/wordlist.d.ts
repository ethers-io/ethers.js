export declare function check(wordlist: Wordlist): string;
export declare abstract class Wordlist {
    readonly locale: string;
    constructor(locale: string);
    abstract getWord(index: number): string;
    abstract getWordIndex(word: string): number;
    split(mnemonic: string): Array<string>;
    join(words: Array<string>): string;
}
export declare function register(lang: Wordlist, name?: string): void;
