"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordlistOwlA = void 0;
const wordlist_owl_js_1 = require("./wordlist-owl.js");
const decode_owla_js_1 = require("./decode-owla.js");
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
class WordlistOwlA extends wordlist_owl_js_1.WordlistOwl {
    #accent;
    constructor(locale, data, accent, checksum) {
        super(locale, data, checksum);
        this.#accent = accent;
    }
    get _accent() { return this.#accent; }
    _decodeWords() {
        return (0, decode_owla_js_1.decodeOwlA)(this._data, this._accent);
    }
}
exports.WordlistOwlA = WordlistOwlA;
//# sourceMappingURL=wordlist-owla.js.map