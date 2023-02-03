import { WordlistOwl } from "./wordlist-owl.js";
/**
 *  An OWL-A format Wordlist extends the OWL format to add an
 *  overlay onto an OWL format Wordlist to support diacritic
 *  marks.
 *
 *  This class is generally not useful to most developers as
 *  it is used mainly internally to keep Wordlists for languages
 *  based on latin-1 small.
 *
 *  If necessary, there are tools within the ``generation/`` folder
 *  to create these necessary data.
 */
export declare class WordlistOwlA extends WordlistOwl {
    #private;
    constructor(locale: string, data: string, accent: string, checksum: string);
    get _accent(): string;
    _decodeWords(): Array<string>;
}
