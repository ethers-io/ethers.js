import { Wordlist } from "./wordlist";
declare class LangKo extends Wordlist {
    constructor();
    getWord(index: number): string;
    getWordIndex(word: string): number;
}
declare const langKo: LangKo;
export { langKo };
