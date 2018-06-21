import { Wordlist } from './wordlist';
declare class LangKr extends Wordlist {
    constructor();
    getWord(index: number): string;
    getWordIndex(word: string): number;
}
declare const langKr: LangKr;
export { langKr };
