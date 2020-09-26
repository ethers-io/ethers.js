import fs from "fs";
import { dirname, resolve } from "path";

import { createHash } from "crypto";

export function repeat(char: string, length: number): string {
    if (char.length === 0) { return ""; }
    let output = char;
    while (output.length < length) { output = output + output; }
    return output.substring(0, length);
}

export function sha256(content: Buffer): string {
    const hasher = createHash("sha256");
    hasher.update(content);
    return "0x" + hasher.digest("hex");
}

export function sortRecords(record: Record<string, any>): Record<string, any> {
    const keys = Object.keys(record);
    keys.sort();

    return keys.reduce((accum, name) => {
        accum[name] = record[name];
        return accum;
    }, <Record<string, any>>{ });
}

export function atomicWrite(path: string, value: string | Uint8Array): void {
    const tmp = resolve(__dirname, "../../../.atomic-tmp");
    fs.writeFileSync(tmp, value);
    fs.renameSync(tmp, path);
}

export function loadJson(path: string): any {
    return JSON.parse(fs.readFileSync(path).toString());
}

export function saveJson(filename: string, data: any, sort?: boolean): any {

    let replacer: (key: string, value: any) => any = undefined;
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

export async function resolveProperties(props: Record<string, Promise<any>>): Promise<Record<string, any>> {
    const keys = Object.keys(props);
    const promises = await Promise.all(keys.map((k) => props[k]));
    return keys.reduce((accum, key, index) => {
        accum[key] = promises[index];
        return accum;
    }, <Record<string, any>>{});
}

// Node 8 does not support recursive mkdir... Remove this in v6.
export function mkdir(path: string): void {
    let bail = 0;
    const dirs = [ ];
    while (path !== "/") {
        if (bail++ > 50) { throw new Error("something bad happened..."); }

        if (fs.existsSync(path)) { break; }
        dirs.push(path);
        path = dirname(path);
    }

    while (dirs.length) {
        fs.mkdirSync(dirs.pop());
    }
}

function zpad(value: number, length?: number): string {
    if (length == null) { length = 2; }
    const str = String(value);
    return repeat("0", length - str.length) + str;
}

function getDate(date: Date): string {
    return [
        date.getFullYear(),
        zpad(date.getMonth() + 1),
        zpad(date.getDate())
    ].join("-");
}

export function getDateTime(date: Date): string {
    return getDate(date) + " " + [
        zpad(date.getHours()) ,
        zpad(date.getMinutes() + 1)
    ].join(":");
}
