// Use the encode-latin.js script to create the necessary
// data files to be consumed by this class
import { id } from "../hash/index.js";
import { throwArgumentError } from "../utils/index.js";
import { decodeOwl } from "./decode-owl.js";
import { Wordlist } from "./wordlist.js";
export class WordlistOwl extends Wordlist {
    #data;
    #checksum;
    constructor(locale, data, checksum) {
        super(locale);
        this.#data = data;
        this.#checksum = checksum;
        this.#words = null;
    }
    get _data() { return this.#data; }
    _decodeWords() {
        return decodeOwl(this.#data);
    }
    #words;
    #loadWords() {
        if (this.#words == null) {
            const words = this._decodeWords();
            // Verify the computed list matches the official list
            const checksum = id(words.join("\n") + "\n");
            /* c8 ignore start */
            if (checksum !== this.#checksum) {
                throw new Error(`BIP39 Wordlist for ${this.locale} FAILED`);
            }
            /* c8 ignore stop */
            this.#words = words;
        }
        return this.#words;
    }
    getWord(index) {
        const words = this.#loadWords();
        if (index < 0 || index >= words.length) {
            throwArgumentError(`invalid word index: ${index}`, "index", index);
        }
        return words[index];
    }
    getWordIndex(word) {
        return this.#loadWords().indexOf(word);
    }
}
//# sourceMappingURL=wordlist-owl.js.map