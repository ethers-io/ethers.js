import fs from "fs";

import { getVersions } from "./utils/npm.js";
import { resolve } from "./utils/path.js";
import { getDiff } from "./utils/git.js";

function escver(v: string): string {
    return v.replace(/\./, "-");
}

(async function() {
    let versions = await getVersions("ethers");
    versions = versions.filter((h) => (h.version.match(/^6\.[0-9]+\.[0-9]+$/)));
    fs.writeFileSync(resolve("misc/diffs/versions.txt"), versions.map((h) => h.version).join(","));
    for (let i = 0; i < versions.length; i++) {
        for (let j = i + 1; j < versions.length; j++) {
            const filename = resolve(`misc/diffs/diff-${ escver(versions[i].version) }_${ escver(versions[j].version) }.txt`);
            if (fs.existsSync(filename)) { continue; }
            const tag0 = versions[i].gitHead, tag1 = versions[j].gitHead;
            const diff = await getDiff(resolve("src.ts"), tag0, tag1);
            console.log({ diff });
            fs.writeFileSync(filename, diff);
        }
    }
})();
