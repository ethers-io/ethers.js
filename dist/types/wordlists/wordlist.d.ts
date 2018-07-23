import { Wordlist as _Wordlist } from '../utils/types';
export declare function check(wordlist: _Wordlist): string;
export declare abstract class Wordlist implements _Wordlist {
    locale: string;
    constructor(locale: string);
    abstract getWord(index: number): string;
    abstract getWordIndex(word: string): number;
    split(mnemonic: string): Array<string>;
    join(words: Array<string>): string;
}
export declare function register(lang: Wordlist, name?: string): void;
//# sourceMappingURL=wordlist.d.ts.map