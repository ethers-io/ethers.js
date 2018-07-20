"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This gets overriddenby gulp during bip39-XX
var exportWordlist = false;
var hash_1 = require("../utils/hash");
var properties_1 = require("../utils/properties");
function check(wordlist) {
    var words = [];
    for (var i = 0; i < 2048; i++) {
        var word = wordlist.getWord(i);
        if (i !== wordlist.getWordIndex(word)) {
            return '0x';
        }
        words.push(word);
    }
    return hash_1.id(words.join('\n') + '\n');
}
exports.check = check;
var Wordlist = /** @class */ (function () {
    function Wordlist(locale) {
        properties_1.defineReadOnly(this, 'locale', locale);
    }
    // Subclasses may override this
    Wordlist.prototype.split = function (mnemonic) {
        return mnemonic.toLowerCase().split(/ +/g);
    };
    // Subclasses may override this
    Wordlist.prototype.join = function (words) {
        return words.join(' ');
    };
    return Wordlist;
}());
exports.Wordlist = Wordlist;
function register(lang, name) {
    if (!name) {
        name = lang.locale;
    }
    if (exportWordlist) {
        var g = global;
        if (!(g.wordlists)) {
            properties_1.defineReadOnly(g, 'wordlists', {});
        }
        if (!g.wordlists[name]) {
            properties_1.defineReadOnly(g.wordlists, name, lang);
        }
        if (g.ethers && g.ethers.wordlists) {
            if (!g.ethers.wordlists[name]) {
                properties_1.defineReadOnly(g.ethers.wordlists, name, lang);
            }
        }
    }
}
exports.register = register;
