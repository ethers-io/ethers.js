
// This gets overriddenby gulp during bip39-XX
var exportWordlist = false;

import { defineReadOnly } from '../utils/properties';

export abstract class Wordlist {
    locale: string;

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

export function register(lang: Wordlist): void {
    if (exportWordlist) {
        if (!(<any>global).wordlists) { defineReadOnly(global, 'wordlists', { }); }
        defineReadOnly((<any>global).wordlists, lang.locale, lang);
    }
}
