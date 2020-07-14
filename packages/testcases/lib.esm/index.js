'use strict';
import fs from 'fs';
import path from 'path';
import zlib from 'browserify-zlib';
import { randomBytes, randomHexString, randomNumber } from "./random";
export { randomBytes, randomHexString, randomNumber };
export function saveTests(tag, data) {
    //let filename = path.resolve(__dirname, 'testcases', tag + '.json.gz');
    let filename = path.resolve(__dirname, '../testcases', tag + '.json.gz');
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
//# sourceMappingURL=index.js.map