import fs from "fs";

import * as local from "./local";
import { colorify } from "./log";
import * as npm from "./npm";
import { resolve } from "./path";
import { repeat } from "./utils";

const changelogPath = resolve("CHANGELOG.md");

export async function generate(): Promise<void> {
    const lines = fs.readFileSync(changelogPath).toString().trim().split("\n");

    const versions: Array<string> = Object.keys(lines.reduce((accum, line) => {
        const match = line.match(/^ethers\/v([^ ]*)/);
        if (match) { accum[match[1]] = true; }
        return accum;
    }, <Record<string, boolean>>{ }));

    const version = local.getPackage("ethers").version;;
    const publishedVersion = (await npm.getPackage("ethers")).version;

    console.log(versions, version, publishedVersion);
    if (versions.indexOf(version) >= 0) {
        const line = `Version ${ version } already in CHANGELOG. Please edit before committing.`;
        console.log(colorify.red(repeat("=", line.length)));
        console.log(colorify.red(line));
        console.log(colorify.red(repeat("=", line.length)));
    }

    
}

(async function() {
    await generate();
})();
