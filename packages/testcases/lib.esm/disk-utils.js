'use strict';
import inflate from "tiny-inflate";
import { ethers } from "ethers";
// This file is populated by the rollup-pre-alias.config.js
import data from "./browser-data.json";
export function saveTests(tag, data) {
    throw new Error("browser does not support writing testcases");
}
const Cache = {};
export function loadTests(tag) {
    let filename = 'testcases/' + tag + ".json.gz";
    if (Cache[filename] == null) {
        console.log(`Loading Test Case: ${filename}`);
        try {
            let fileData = data[filename];
            const comps = fileData.split(",");
            const size = parseInt(comps[0]), compressedData = ethers.utils.base64.decode(comps[1]);
            const uncompressedData = new Uint8Array(size);
            inflate(compressedData, uncompressedData);
            Cache[filename] = JSON.parse(ethers.utils.toUtf8String(uncompressedData));
        }
        catch (error) {
            console.log("ERROR", error);
            throw error;
        }
    }
    return Cache[filename];
}
export function loadData(filename) {
    // Strip any leading relative paths (e.g. "./foo" => "foo")
    filename = filename.replace(/^[^a-z0-9_]/i, "");
    console.log(`Loading Data File: ${filename}`);
    //filename = path.join(filename);
    return ethers.utils.base64.decode(data[filename]);
}
//# sourceMappingURL=disk-utils.js.map