'use strict';

import path from 'path';

import zlib from "browserify-zlib";

import * as data from "./browser-fs.json";


export function loadTests(tag: string): any {
    let filename = 'testcases/' + tag + ".json.gz";
    console.log("loading:", filename);
    return JSON.parse(zlib.gunzipSync(new Buffer((<any>data)[filename], "base64")).toString());
}

export function loadData(filename: string): Buffer {
    // Strip any leading relative paths (e.g. "./foo" => "foo")
    filename = path.join(filename);
    console.log("loading:", filename);
    return new Buffer((<any>data)[filename], "base64");
}
