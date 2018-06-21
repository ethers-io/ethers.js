import { Wordlist } from './wordlist';
declare class LangZh extends Wordlist {
    private _country;
    constructor(country: any);
    getWord(index: number): string;
    getWordIndex(word: string): number;
    split(mnemonic: string): Array<string>;
}
declare const langZhCn: LangZh;
declare const langZhTw: LangZh;
export { langZhCn, langZhTw };
