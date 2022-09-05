"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessListify = void 0;
const index_js_1 = require("../address/index.js");
const index_js_2 = require("../utils/index.js");
function accessSetify(addr, storageKeys) {
    return {
        address: (0, index_js_1.getAddress)(addr),
        storageKeys: (storageKeys || []).map((storageKey, index) => {
            if ((0, index_js_2.dataLength)(storageKey) !== 32) {
                //logger.throwArgumentError("invalid access list storageKey", `accessList[${ addr }>
                throw new Error("");
            }
            return storageKey.toLowerCase();
        })
    };
}
function accessListify(value) {
    if (Array.isArray(value)) {
        return value.map((set, index) => {
            if (Array.isArray(set)) {
                if (set.length > 2) {
                    //logger.throwArgumentError("access list expected to be [ address, storageKeys[>
                    throw new Error("");
                }
                return accessSetify(set[0], set[1]);
            }
            return accessSetify(set.address, set.storageKeys);
        });
    }
    const result = Object.keys(value).map((addr) => {
        const storageKeys = value[addr].reduce((accum, storageKey) => {
            accum[storageKey] = true;
            return accum;
        }, {});
        return accessSetify(addr, Object.keys(storageKeys).sort());
    });
    result.sort((a, b) => (a.address.localeCompare(b.address)));
    return result;
}
exports.accessListify = accessListify;
//# sourceMappingURL=accesslist.js.map