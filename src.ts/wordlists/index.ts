'use strict';

// Wordlists
// See: https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md


import { Wordlist } from '../utils/wordlist';

import { langEn as _en } from './lang-en';
import { langEs as _es } from './lang-es';
import { langFr as _fr } from './lang-fr';
import { langJa as _ja } from './lang-ja';
import { langKo as _ko } from './lang-ko';
import { langIt as _it } from './lang-it';
import { langZhCn as _zh_cn, langZhTw as _zh_tw } from './lang-zh';

const en: Wordlist = _en;
const es: Wordlist = _es;
const fr: Wordlist = _fr;
const it: Wordlist = _it;
const ja: Wordlist = _ja;
const ko: Wordlist = _ko;
const zh: Wordlist = _zh_cn;
const zh_cn: Wordlist = _zh_cn;
const zh_tw: Wordlist = _zh_tw;

export {
    en, es, fr, it, ja, ko, zh, zh_cn, zh_tw
}
