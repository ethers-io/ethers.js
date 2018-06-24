
import { Wordlist } from './wordlist';

import { langJa as _ja } from './lang-ja';
import { langKo as _ko } from './lang-ko';
import { langIt as _it } from './lang-it';
import { langEn as _en } from './lang-en';
import { langZhCn as _zh_cn, langZhTw as _zh_tw } from './lang-zh';

const en: Wordlist = _en;
const ko: Wordlist = _ko;
const it: Wordlist = _it;
const ja: Wordlist = _ja;
const zh: Wordlist = _zh_cn;
const zh_cn: Wordlist = _zh_cn;
const zh_tw: Wordlist = _zh_tw;

export {
    en, it, ja, ko, zh, zh_cn, zh_tw
}

export default {
    en, it, ja, ko, zh, zh_cn, zh_tw
}
