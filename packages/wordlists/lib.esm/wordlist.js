"use strict";
// This gets overriddenby gulp during bip39-XX
let exportWordlist = false;
import { id } from "@ethersproject/hash";
import { defineReadOnly } from "@ethersproject/properties";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
export function check(wordlist) {
    let words = [];
    for (let i = 0; i < 2048; i++) {
        let word = wordlist.getWord(i);
        if (i !== wordlist.getWordIndex(word)) {
            return "0x";
        }
        words.push(word);
    }
    return id(words.join("\n") + "\n");
}
export class Wordlist {
    constructor(locale) {
        logger.checkAbstract(new.target, Wordlist);
        defineReadOnly(this, "locale", locale);
    }
    // Subclasses may override this
    split(mnemonic) {
        return mnemonic.toLowerCase().split(/ +/g);
    }
    // Subclasses may override this
    join(words) {
        return words.join(" ");
    }
}
export function register(lang, name) {
    if (!name) {
        name = lang.locale;
    }
    if (exportWordlist) {
        let g = global;
        if (!(g.wordlists)) {
            defineReadOnly(g, "wordlists", {});
        }
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
