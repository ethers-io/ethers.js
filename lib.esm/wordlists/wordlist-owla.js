import { WordlistOwl } from "./wordlist-owl.js";
import { decodeOwlA } from "./decode-owla.js";
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