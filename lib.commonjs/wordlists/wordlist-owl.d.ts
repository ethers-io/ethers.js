import { Wordlist } from "./wordlist.js";
/**
 *  An OWL format Wordlist is an encoding method that exploits
 *  the general locality of alphabetically sorted words to
 *  achieve a simple but effective means of compression.
 *
 *  This class is generally not useful to most developers as
 *  it is used mainly internally to keep Wordlists for languages
 *  based on ASCII-7 small.
 *
 *  If necessary, there are tools within the ``generation/`` folder
 *  to create these necessary data.
 */
export declare class WordlistOwl extends Wordlist {
    #private;
    /**
     *  Creates a new Wordlist for %%locale%% using the OWL %%data%%
     *  and validated against the %%checksum%%.
     */
    constructor(locale: string, data: string, checksum: string);
    get _data(): string;
    _decodeWords(): Array<string>;
    getWord(index: number): string;
    getWordIndex(word: string): number;
}
