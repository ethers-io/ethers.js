// Use the encode-latin.js script to create the necessary
// data files to be consumed by this class
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _WordlistOwl_instances, _WordlistOwl_data, _WordlistOwl_checksum, _WordlistOwl_words, _WordlistOwl_loadWords;
import { id } from "@ethersproject/hash";
import { decodeOwl } from "./decode-owl.js";
import { logger } from "./logger.js";
import { Wordlist } from "./wordlist.js";
export class WordlistOwl extends Wordlist {
    constructor(locale, data, checksum) {
        super(locale);
        _WordlistOwl_instances.add(this);
        _WordlistOwl_data.set(this, void 0);
        _WordlistOwl_checksum.set(this, void 0);
        _WordlistOwl_words.set(this, void 0);
        __classPrivateFieldSet(this, _WordlistOwl_data, data, "f");
        __classPrivateFieldSet(this, _WordlistOwl_checksum, checksum, "f");
        __classPrivateFieldSet(this, _WordlistOwl_words, null, "f");
    }
    get _data() { return __classPrivateFieldGet(this, _WordlistOwl_data, "f"); }
    _decodeWords() {
        return decodeOwl(__classPrivateFieldGet(this, _WordlistOwl_data, "f"));
    }
    getWord(index) {
        const words = __classPrivateFieldGet(this, _WordlistOwl_instances, "m", _WordlistOwl_loadWords).call(this);
        if (index < 0 || index >= words.length) {
            logger.throwArgumentError(`invalid word index: ${index}`, "index", index);
        }
        return words[index];
    }
    getWordIndex(word) {
        return __classPrivateFieldGet(this, _WordlistOwl_instances, "m", _WordlistOwl_loadWords).call(this).indexOf(word);
    }
}
_WordlistOwl_data = new WeakMap(), _WordlistOwl_checksum = new WeakMap(), _WordlistOwl_words = new WeakMap(), _WordlistOwl_instances = new WeakSet(), _WordlistOwl_loadWords = function _WordlistOwl_loadWords() {
    if (__classPrivateFieldGet(this, _WordlistOwl_words, "f") == null) {
        const words = this._decodeWords();
        // Verify the computed list matches the official list
        const checksum = id(words.join("\n") + "\n");
        /* c8 ignore start */
        if (checksum !== __classPrivateFieldGet(this, _WordlistOwl_checksum, "f")) {
            throw new Error(`BIP39 Wordlist for ${this.locale} FAILED`);
        }
        /* c8 ignore stop */
        __classPrivateFieldSet(this, _WordlistOwl_words, words, "f");
    }
    return __classPrivateFieldGet(this, _WordlistOwl_words, "f");
};
//# sourceMappingURL=wordlist-owl.js.map