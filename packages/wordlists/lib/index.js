"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Wordlists
// See: https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md
var wordlist_1 = require("./wordlist");
exports.logger = wordlist_1.logger;
exports.Wordlist = wordlist_1.Wordlist;
var lang_cz_1 = require("./lang-cz");
var lang_en_1 = require("./lang-en");
var lang_es_1 = require("./lang-es");
var lang_fr_1 = require("./lang-fr");
var lang_ja_1 = require("./lang-ja");
var lang_ko_1 = require("./lang-ko");
var lang_it_1 = require("./lang-it");
var lang_zh_1 = require("./lang-zh");
var wordlists = {
    cz: lang_cz_1.langCz,
    en: lang_en_1.langEn,
    es: lang_es_1.langEs,
    fr: lang_fr_1.langFr,
    it: lang_it_1.langIt,
    ja: lang_ja_1.langJa,
    ko: lang_ko_1.langKo,
    zh: lang_zh_1.langZhCn,
    zh_cn: lang_zh_1.langZhCn,
    zh_tw: lang_zh_1.langZhTw
};
exports.wordlists = wordlists;
//# sourceMappingURL=index.js.map