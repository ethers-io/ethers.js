"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wordlist = void 0;
const index_js_1 = require("../utils/index.js");
class Wordlist {
    locale;
    constructor(locale) {
        (0, index_js_1.defineProperties)(this, { locale });
    }
    // Subclasses may override this
    split(mnemonic) {
        return mnemonic.toLowerCase().split(/ +/g);
    }
    // Subclasses may override this
    join(words) {
        return words.join(" ");
    }
}
exports.Wordlist = Wordlist;
//# sourceMappingURL=wordlist.js.map