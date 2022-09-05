import { defineProperties } from "../utils/index.js";
export class Wordlist {
    locale;
    constructor(locale) {
        defineProperties(this, { locale });
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
//# sourceMappingURL=wordlist.js.map