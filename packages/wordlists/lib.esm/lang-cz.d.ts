import { Wordlist } from "./wordlist";
declare class LangCz extends Wordlist {
    constructor();
    getWord(index: number): string;
    getWordIndex(word: string): number;
}
declare const langCz: LangCz;
export { langCz };
