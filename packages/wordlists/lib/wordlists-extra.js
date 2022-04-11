import { langCz as cz } from "./lang-cz.js";
import { langEs as es } from "./lang-es.js";
import { langFr as fr } from "./lang-fr.js";
import { langJa as ja } from "./lang-ja.js";
import { langKo as ko } from "./lang-ko.js";
import { langIt as it } from "./lang-it.js";
import { langPt as pt } from "./lang-pt.js";
import { langZhCn as zh_cn, langZhTw as zh_tw } from "./lang-zh.js";
// These are used by the hijacked imports in the rollup version
// of the extra wordlists. Users should:
// import { ethers } from "./ethers.js";
// import { attachEthers, wordlists } from "./ethers-wordlists.js";
// attachEthers(ethers);
let _ethers = null;
export function attachEthers(ethers) {
    if (_ethers) {
        throw new Error("already attached");
    }
    _ethers = ethers;
}
export function getEthers() {
    if (_ethers) {
        throw new Error("no ethers attached; please use attachEthers");
    }
    return _ethers;
}
export const wordlists = Object.freeze({
    cz, es, fr, ja, ko, it, pt, zh_cn, zh_tw
});
//# sourceMappingURL=wordlists-extra.js.map