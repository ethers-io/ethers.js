"use strict";

/** bundle-testcases
 *
 * This sript converts all the testase data (including needed
 * text files) into a single JSON file.
 *
 * All gzip files (mostly .json.gz) are decompressed and recompressed
 * using deflate, so a much more simple deflate library can be used.
 */


import fs from "fs";
import { join } from "path";
import zlib from "zlib";

import { colorify } from "../log";
import { resolve } from "../path";
import { mkdir } from "../utils";

const config = {
    dirs: [
        "./input/easyseed-bip39",
        "./testcases",
        "./input/wordlists"
    ]
};

(async function() {
    console.log(colorify.bold(`Bundling Testcase Data...`));

    const data: Record<string, string> = { "_": JSON.stringify({ name: "browser-fs", config: config }) };

    config.dirs.forEach((dirname) => {
        let fulldirname = resolve("packages/testcases", dirname);
        fs.readdirSync(fulldirname).forEach((filename) => {
            const key = join(dirname, filename);
            const content = fs.readFileSync(join(fulldirname, filename));
            if (filename.split(".").pop() === "gz") {
                const contentData = zlib.gunzipSync(content);
                data[key] = String(contentData.length) + "," + zlib.deflateRawSync(contentData).toString("base64");
            } else {
                data[key] = content.toString("base64");
            }
            //console.log(`  - Added ${ key } (${ data[key].length } bytes)`);
        });
    });

    mkdir(resolve("packages/testcases/lib"));
    mkdir(resolve("packages/testcases/lib._esm"));
    mkdir(resolve("packages/testcases/lib.esm"));

    // We write it out to all needed places
    fs.writeFileSync(resolve("packages/testcases/lib/browser-data.json"), JSON.stringify(data));
    fs.writeFileSync(resolve("packages/testcases/lib._esm/browser-data.json"), JSON.stringify(data));
    fs.writeFileSync(resolve("packages/testcases/lib.esm/browser-data.json"), JSON.stringify(data));

    // Write it to the TypeScript source last, in case it is running it will
    // be regenerated overwriting the above files, but with identical content
    fs.writeFileSync(resolve("packages/testcases/src.ts/browser-data.json"), JSON.stringify(data));
})();
