"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This gets overridden by rollup
var exportWordlist = false;
var hash_1 = require("@ethersproject/hash");
var properties_1 = require("@ethersproject/properties");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
exports.logger = new logger_1.Logger(_version_1.version);
var Wordlist = /** @class */ (function () {
    function Wordlist(locale) {
        var _newTarget = this.constructor;
        exports.logger.checkAbstract(_newTarget, Wordlist);
        properties_1.defineReadOnly(this, "locale", locale);
    }
    // Subclasses may override this
    Wordlist.prototype.split = function (mnemonic) {
        return mnemonic.toLowerCase().split(/ +/g);
    };
    // Subclasses may override this
    Wordlist.prototype.join = function (words) {
        return words.join(" ");
    };
    Wordlist.check = function (wordlist) {
        var words = [];
        for (var i = 0; i < 2048; i++) {
            var word = wordlist.getWord(i);
            if (i !== wordlist.getWordIndex(word)) {
                return "0x";
            }
            words.push(word);
        }
        return hash_1.id(words.join("\n") + "\n");
    };
    Wordlist.register = function (lang, name) {
        if (!name) {
            name = lang.locale;
        }
        if (exportWordlist) {
            var g = global;
            if (g._ethers && g._ethers.wordlists) {
                if (!g._ethers.wordlists[name]) {
                    properties_1.defineReadOnly(g._ethers.wordlists, name, lang);
                }
            }
        }
    };
    return Wordlist;
}());
exports.Wordlist = Wordlist;
