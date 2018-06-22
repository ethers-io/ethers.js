"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This gets overriddenby gulp during bip39-XX
var exportWordlist = false;
var properties_1 = require("../utils/properties");
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
function register(lang) {
    if (exportWordlist) {
        if (!global['wordlists']) {
            properties_1.defineReadOnly(global, 'wordlists', {});
        }
        properties_1.defineReadOnly(global['wordlists'], lang.locale, lang);
    }
}
exports.register = register;
