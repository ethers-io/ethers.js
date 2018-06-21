import { Wordlist } from './wordlist';
declare class LangJa extends Wordlist {
    constructor();
    getWord(index: any): string;
    getWordIndex(word: any): number;
    split(mnemonic: string): Array<string>;
    join(words: Array<string>): string;
}
declare const langJa: LangJa;
export { langJa };
