"use strict";
// Wordlists
// See: https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md
import { logger, Wordlist } from "./wordlist";
import { langCz as cz } from "./lang-cz";
import { langEn as en } from "./lang-en";
import { langEs as es } from "./lang-es";
import { langFr as fr } from "./lang-fr";
import { langJa as ja } from "./lang-ja";
import { langKo as ko } from "./lang-ko";
import { langIt as it } from "./lang-it";
import { langZhCn as zh_cn, langZhTw as zh_tw } from "./lang-zh";
const wordlists = {
    cz: cz,
    en: en,
    es: es,
    fr: fr,
    it: it,
    ja: ja,
    ko: ko,
    zh: zh_cn,
    zh_cn: zh_cn,
    zh_tw: zh_tw
};
export { logger, Wordlist, wordlists };
//# sourceMappingURL=index.js.map