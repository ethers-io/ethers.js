'use strict';
import fs from 'fs';
import path from 'path';
import zlib from 'browserify-zlib';
import { arrayify, concat, hexlify } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
export function saveTests(tag, data) {
    //let filename = path.resolve(__dirname, 'testcases', tag + '.json.gz');
    let filename = path.resolve('../testcases', tag + '.json.gz');
    fs.writeFileSync(filename, zlib.gzipSync(JSON.stringify(data, undefined, ' ') + '\n'));
    console.log('Save testcase: ' + filename);
}
export function loadTests(tag) {
    let filename = path.resolve(__dirname, '../testcases', tag + '.json.gz');
    return JSON.parse(zlib.gunzipSync(fs.readFileSync(filename)).toString());
}
export function loadData(filename) {
    return fs.readFileSync(path.resolve(__dirname, filename));
}
export function randomBytes(seed, lower, upper) {
    if (!upper) {
        upper = lower;
    }
    if (upper === 0 && upper === lower) {
        return new Uint8Array(0);
    }
    let result = arrayify(keccak256(toUtf8Bytes(seed)));
    while (result.length < upper) {
        result = concat([result, keccak256(result)]);
    }
    let top = arrayify(keccak256(result));
    let percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return result.slice(0, lower + Math.floor((upper - lower) * percent));
}
export function randomHexString(seed, lower, upper) {
    return hexlify(randomBytes(seed, lower, upper));
}
export function randomNumber(seed, lower, upper) {
    let top = randomBytes(seed, 3);
    let percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return lower + Math.floor((upper - lower) * percent);
}
