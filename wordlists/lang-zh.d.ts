import { Wordlist } from '../utils/wordlist';
declare class LangZh extends Wordlist {
    constructor(country: string);
    getWord(index: number): string;
    getWordIndex(word: string): number;
    split(mnemonic: string): Array<string>;
}
declare const langZhCn: LangZh;
declare const langZhTw: LangZh;
export { langZhCn, langZhTw };
