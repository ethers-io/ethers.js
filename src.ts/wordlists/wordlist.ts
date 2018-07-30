
// This gets overriddenby gulp during bip39-XX
var exportWordlist = false;

import { id } from '../utils/hash';

import { defineReadOnly } from '../utils/properties';


export function check(wordlist: Wordlist) {
    var words = [];
    for (let i = 0; i < 2048; i++) {
        let word = wordlist.getWord(i);
        if (i !== wordlist.getWordIndex(word)) { return '0x'; }
        words.push(word);
    }
    return id(words.join('\n') + '\n');
}

export abstract class Wordlist {
    readonly locale: string;

    constructor(locale: string) {
        defineReadOnly(this, 'locale', locale);
    }

    abstract getWord(index: number): string;
    abstract getWordIndex(word: string): number;

    // Subclasses may override this
    split(mnemonic: string): Array<string> {
        return mnemonic.toLowerCase().split(/ +/g)
    }

    // Subclasses may override this
    join(words: Array<string>): string {
        return words.join(' ');
    }
}

export function register(lang: Wordlist, name?: string): void {
    if (!name) { name = lang.locale; }
    if (exportWordlist) {
        let g: any = (<any>global)
        if (!(g.wordlists)) { defineReadOnly(g, 'wordlists', { }); }
        if (!g.wordlists[name]) {
            defineReadOnly(g.wordlists, name, lang);
        }
        if (g.ethers && g.ethers.wordlists) {
            if (!g.ethers.wordlists[name]) {
                defineReadOnly(g.ethers.wordlists, name, lang);
            }
        }
    }
}
