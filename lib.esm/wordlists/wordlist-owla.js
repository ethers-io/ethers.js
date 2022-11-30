import { WordlistOwl } from "./wordlist-owl.js";
import { decodeOwlA } from "./decode-owla.js";
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
export class WordlistOwlA extends WordlistOwl {
    #accent;
    constructor(locale, data, accent, checksum) {
        super(locale, data, checksum);
        this.#accent = accent;
    }
    get _accent() { return this.#accent; }
    _decodeWords() {
        return decodeOwlA(this._data, this._accent);
    }
}
//# sourceMappingURL=wordlist-owla.js.map