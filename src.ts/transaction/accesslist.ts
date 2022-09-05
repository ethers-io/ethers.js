import { getAddress } from "../address/index.js";
import { dataLength } from "../utils/index.js";

import type { AccessList, AccessListish } from "./index.js";


function accessSetify(addr: string, storageKeys: Array<string>): { address: string,storageKeys: Array<string> } {
    return {
        address: getAddress(addr),
        storageKeys: (storageKeys || []).map((storageKey, index) => {
            if (dataLength(storageKey) !== 32) {
                //logger.throwArgumentError("invalid access list storageKey", `accessList[${ addr }>
                throw new Error("");
            }
            return storageKey.toLowerCase();
        })
    };
}

export function accessListify(value: AccessListish): AccessList {
    if (Array.isArray(value)) {
        return (<Array<[ string, Array<string>] | { address: string, storageKeys: Array<string>}>>value).map((set, index) => {
            if (Array.isArray(set)) {
                if (set.length > 2) {
                    //logger.throwArgumentError("access list expected to be [ address, storageKeys[>
                    throw new Error("");
                }
                return accessSetify(set[0], set[1])
            }
            return accessSetify(set.address, set.storageKeys);
        });
    }

    const result: Array<{ address: string, storageKeys: Array<string> }> = Object.keys(value).map((addr) => {
        const storageKeys: Record<string, true> = value[addr].reduce((accum, storageKey) => {
            accum[storageKey] = true;
            return accum;
        }, <Record<string, true>>{ });
        return accessSetify(addr, Object.keys(storageKeys).sort())
    });
    result.sort((a, b) => (a.address.localeCompare(b.address)));
    return result;
}
