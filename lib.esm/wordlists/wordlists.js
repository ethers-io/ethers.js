import { LangCz } from "./lang-cz.js";
import { LangEn } from "./lang-en.js";
import { LangEs } from "./lang-es.js";
import { LangFr } from "./lang-fr.js";
import { LangJa } from "./lang-ja.js";
import { LangKo } from "./lang-ko.js";
import { LangIt } from "./lang-it.js";
import { LangPt } from "./lang-pt.js";
import { LangZh } from "./lang-zh.js";
export const wordlists = {
    cz: LangCz.wordlist(),
    en: LangEn.wordlist(),
    es: LangEs.wordlist(),
    fr: LangFr.wordlist(),
    it: LangIt.wordlist(),
    pt: LangPt.wordlist(),
    ja: LangJa.wordlist(),
    ko: LangKo.wordlist(),
    zh_cn: LangZh.wordlist("cn"),
    zh_tw: LangZh.wordlist("tw"),
};
//# sourceMappingURL=wordlists.js.map