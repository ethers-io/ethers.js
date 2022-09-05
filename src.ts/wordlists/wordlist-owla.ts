
import { WordlistOwl } from "./wordlist-owl.js";
import { decodeOwlA } from "./decode-owla.js";

export class WordlistOwlA extends WordlistOwl {
    #accent: string;

    constructor(locale: string, data: string, accent: string, checksum: string) {
        super(locale, data, checksum);
        this.#accent = accent;
    }

    get _accent(): string { return this.#accent; }

    _decodeWords(): Array<string> {
        return decodeOwlA(this._data, this._accent);
    }
}
