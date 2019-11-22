"use strict";

// This gets overridden by rollup
const exportWordlist = false;

import { id } from "@ethersproject/hash";
import { defineReadOnly } from "@ethersproject/properties";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

export function check(wordlist: Wordlist): string {
    const words = [];
    for (let i = 0; i < 2048; i++) {
        const word = wordlist.getWord(i);
        if (i !== wordlist.getWordIndex(word)) { return "0x"; }
        words.push(word);
    }
    return id(words.join("\n") + "\n");
}

export abstract class Wordlist {
    readonly locale: string;

    constructor(locale: string) {
        logger.checkAbstract(new.target, Wordlist);
        defineReadOnly(this, "locale", locale);
    }

    abstract getWord(index: number): string;
    abstract getWordIndex(word: string): number;

    // Subclasses may override this
    split(mnemonic: string): Array<string> {
        return mnemonic.toLowerCase().split(/ +/g)
    }

    // Subclasses may override this
    join(words: Array<string>): string {
        return words.join(" ");
    }
}

export function register(lang: Wordlist, name?: string): void {
    if (!name) { name = lang.locale; }
    if (exportWordlist) {
        const g: any = (<any>global)
        if (g._ethers && g._ethers.wordlists) {
            if (!g._ethers.wordlists[name]) {
                defineReadOnly(g._ethers.wordlists, name, lang);
            }
            /*
            if (g.wordlists == null) {
                g.wordlists = g._ethers.wordlists;
            } else if (g.wordlists[name] == null) {
                g.wordlists[name] = lang;
            }
            */
        }
    }
}
