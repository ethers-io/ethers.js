import { defineProperties } from "@ethersproject/properties";

export abstract class Wordlist {
    locale!: string;

    constructor(locale: string) {
        defineProperties<Wordlist>(this, { locale });
    }

    // Subclasses may override this
    split(mnemonic: string): Array<string> {
        return mnemonic.toLowerCase().split(/ +/g)
    }

    // Subclasses may override this
    join(words: Array<string>): string {
        return words.join(" ");
    }

    abstract getWord(index: number): string;
    abstract getWordIndex(word: string): number;
}
