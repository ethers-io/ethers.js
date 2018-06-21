import { Wordlist } from './wordlist';
declare class LangIt extends Wordlist {
    constructor();
    getWord(index: number): string;
    getWordIndex(word: string): number;
}
declare const langIt: LangIt;
export { langIt };
