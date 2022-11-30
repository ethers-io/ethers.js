"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wordlists = void 0;
const lang_cz_js_1 = require("./lang-cz.js");
const lang_en_js_1 = require("./lang-en.js");
const lang_es_js_1 = require("./lang-es.js");
const lang_fr_js_1 = require("./lang-fr.js");
const lang_ja_js_1 = require("./lang-ja.js");
const lang_ko_js_1 = require("./lang-ko.js");
const lang_it_js_1 = require("./lang-it.js");
const lang_pt_js_1 = require("./lang-pt.js");
const lang_zh_js_1 = require("./lang-zh.js");
exports.wordlists = {
    cz: lang_cz_js_1.LangCz.wordlist(),
    en: lang_en_js_1.LangEn.wordlist(),
    es: lang_es_js_1.LangEs.wordlist(),
    fr: lang_fr_js_1.LangFr.wordlist(),
    it: lang_it_js_1.LangIt.wordlist(),
    pt: lang_pt_js_1.LangPt.wordlist(),
    ja: lang_ja_js_1.LangJa.wordlist(),
    ko: lang_ko_js_1.LangKo.wordlist(),
    zh_cn: lang_zh_js_1.LangZh.wordlist("cn"),
    zh_tw: lang_zh_js_1.LangZh.wordlist("tw"),
};
//# sourceMappingURL=wordlists.js.map