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
var _WordlistOwlA_accent;
import { WordlistOwl } from "./wordlist-owl.js";
import { decodeOwlA } from "./decode-owla.js";
export class WordlistOwlA extends WordlistOwl {
    constructor(locale, data, accent, checksum) {
        super(locale, data, checksum);
        _WordlistOwlA_accent.set(this, void 0);
        __classPrivateFieldSet(this, _WordlistOwlA_accent, accent, "f");
    }
    get _accent() { return __classPrivateFieldGet(this, _WordlistOwlA_accent, "f"); }
    _decodeWords() {
        return decodeOwlA(this._data, this._accent);
    }
}
_WordlistOwlA_accent = new WeakMap();
//# sourceMappingURL=wordlist-owla.js.map