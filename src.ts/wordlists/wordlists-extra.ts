
import { langCz as cz } from "./lang-cz.js";
import { langEs as es } from "./lang-es.js";
import { langFr as fr } from "./lang-fr.js";
import { langJa as ja } from "./lang-ja.js";
import { langKo as ko } from "./lang-ko.js";
import { langIt as it } from "./lang-it.js";
import { langPt as pt } from "./lang-pt.js";
import { langZhCn as zh_cn, langZhTw as zh_tw } from "./lang-zh.js";

import type { Wordlist } from "./wordlist.js";

export const wordlists: Record<string, Wordlist> = Object.freeze({
    cz, es, fr, ja, ko, it, pt, zh_cn, zh_tw
});
