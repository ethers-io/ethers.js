import { Wordlist } from '../utils/wordlist';
declare class LangFr extends Wordlist {
    constructor();
    getWord(index: number): string;
    getWordIndex(word: string): number;
}
declare const langFr: LangFr;
export { langFr };
