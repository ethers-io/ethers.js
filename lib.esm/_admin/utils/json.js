import fs from "fs";
import { atomicWrite } from "./fs.js";
export function loadJson(path) {
    return JSON.parse(fs.readFileSync(path).toString());
}
export function saveJson(filename, data, sort) {
    let replacer = undefined;
    if (sort) {
        replacer = (key, value) => {
            if (Array.isArray(value)) {
                // pass
            }
            else if (value && typeof (value) === "object") {
                const keys = Object.keys(value);
                let sortFunc;
                if (typeof (sort) === "function") {
                    sortFunc = function (a, b) {
                        return sort(key, a, b);
                    };
                }
                keys.sort(sortFunc);
                return keys.reduce((accum, key) => {
                    accum[key] = value[key];
                    return accum;
                }, {});
            }
            return value;
        };
    }
    atomicWrite(filename, JSON.stringify(data, replacer, 2) + "\n");
}
//# sourceMappingURL=json.js.map