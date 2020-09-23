'use strict';
import path from 'path';
import zlib from "browserify-zlib";
import { randomBytes, randomHexString, randomNumber } from "./random";
export { randomBytes, randomHexString, randomNumber };
import * as _data from "./browser-fs.json";
// TypeScript, rollup and friends don't play nice with this JSON
const _anyData = _data;
const data = _anyData["default"] ? _anyData["default"] : _anyData;
const Cache = {};
export function loadTests(tag) {
    let filename = 'testcases/' + tag + ".json.gz";
    if (Cache[filename] == null) {
        console.log("loading:", filename);
        Cache[filename] = JSON.parse(zlib.gunzipSync(new Buffer(data[filename], "base64")).toString());
    }
    return Cache[filename];
}
export function loadData(filename) {
    // Strip any leading relative paths (e.g. "./foo" => "foo")
    filename = path.join(filename);
    console.log("loading:", filename);
    return new Buffer(data[filename], "base64");
}
//# sourceMappingURL=browser.js.map