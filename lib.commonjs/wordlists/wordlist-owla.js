"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordlistOwlA = void 0;
const wordlist_owl_js_1 = require("./wordlist-owl.js");
const decode_owla_js_1 = require("./decode-owla.js");
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