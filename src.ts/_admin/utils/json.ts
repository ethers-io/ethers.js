import fs from "fs";

import { atomicWrite } from "./fs.js";


export function loadJson(path: string): any {
    return JSON.parse(fs.readFileSync(path).toString());
}

type Replacer = (key: string, value: any) => any;

export function saveJson(filename: string, data: any, sort?: boolean): any {

    let replacer: (Replacer | undefined) = undefined;
    if (sort) {
        replacer = (key, value) => {
            if (Array.isArray(value)) {
                // pass
            } else if (value && typeof(value) === "object") {
                const keys = Object.keys(value);
                keys.sort();
                return keys.reduce((accum, key) => {
                    accum[key] = value[key];
                    return accum;
                }, <Record<string, any>>{});
            }
            return value;
        };
    }

    atomicWrite(filename, JSON.stringify(data, replacer, 2) + "\n");
}
