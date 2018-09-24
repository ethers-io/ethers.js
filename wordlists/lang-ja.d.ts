import { Wordlist } from '../utils/wordlist';
declare class LangJa extends Wordlist {
    constructor();
    getWord(index: number): string;
    getWordIndex(word: string): number;
    split(mnemonic: string): Array<string>;
    join(words: Array<string>): string;
}
declare const langJa: LangJa;
export { langJa };
