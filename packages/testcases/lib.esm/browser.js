'use strict';
import path from 'path';
import zlib from "browserify-zlib";
import * as data from "./browser-fs.json";
export function loadTests(tag) {
    let filename = 'testcases/' + tag + ".json.gz";
    console.log("loading:", filename);
    return JSON.parse(zlib.gunzipSync(new Buffer(data[filename], "base64")).toString());
}
export function loadData(filename) {
    // Strip any leading relative paths (e.g. "./foo" => "foo")
    filename = path.join(filename);
    console.log("loading:", filename);
    return new Buffer(data[filename], "base64");
}
