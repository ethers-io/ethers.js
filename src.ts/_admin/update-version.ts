import semver from "semver";

import { FetchRequest } from "../utils/index.js";

import { atomicWrite } from "./utils/fs.js";
import { getLogs } from "./utils/git.js";
import { loadJson, saveJson } from "./utils/json.js";
import { resolve } from "./utils/path.js";


const cache: Record<string, any> = { };

async function getNpmPackage(name: string): Promise<any> {
    if (!cache[name]) {
        const resp = await (new FetchRequest("https:/\/registry.npmjs.org/" + name)).send();
        resp.assertOk();
        cache[name] = resp.bodyJson;
    }

    return cache[name] || null;
}

function writeVersion(version: string): void {
    const content = `/* Do NOT modify this file; see /src.ts/_admin/update-version.ts */\n\n/**\n *  The current version of Ethers.\n */\nexport const version: string = "${ version }";\n`;
    atomicWrite(resolve("src.ts/_version.ts"), content);
}

(async function() {
    // Local pkg
    const pkgPath = resolve("package.json");
    const pkgInfo = loadJson(pkgPath);
    const tag = pkgInfo.publishConfig.tag;

    // Get the remote version that matches our dist-tag
    const remoteInfo = await getNpmPackage(pkgInfo.name);
    const remoteVersion = remoteInfo["dist-tags"][tag];

    // Remote pkg
    const remotePkgInfo = remoteInfo.versions[remoteVersion];
    const remoteGitHead = remotePkgInfo.gitHead;

    let gitHead = "";
    for (const log of await getLogs([ "." ])) {
        if (log.body.startsWith("admin:")) { continue; }
        if (log.body.startsWith("tests:")) { continue; }
        gitHead = log.commit;
        break;
    }
    if (gitHead === "") { throw new Error("no meaningful commit found"); }

    // There are new commits, not reflected in the package
    // published on npm; update the gitHead and version
    if (gitHead !== remoteGitHead) {

       // Bump the version from the remote version
       if (tag.indexOf("beta") >= 0) {
            // Still a beta branch; advance the beta version
            const prerelease = semver.prerelease(remoteVersion);
            if (prerelease == null || prerelease.length !== 2) {
                throw new Error("no prerelease found");
            }
            pkgInfo.version = semver.inc(remoteVersion, "prerelease", String(prerelease[0]));
        } else if (semver.minor(remoteVersion) == semver.minor(pkgInfo.version)) {
            // If we want to bump the minor version, it was done explicitly in the pkg
            pkgInfo.version = semver.inc(remoteVersion, "patch");
        }

        pkgInfo.gitHead = gitHead;

        // Save the package.json
        const check: Record<string, number> = { "require": 1, "import": 1, "types": 1 };
        saveJson(pkgPath, pkgInfo, (path: string, a: string, b: string) => {
            if (path.startsWith("./") && check[a] && check[b]) {
                if (a === "types") { return -1; }
                if (b === "types") { return 1; }
            }
            return a.localeCompare(b);
        });

        // Save the src.ts/_version.ts
        writeVersion(pkgInfo.version);
    }

})().catch((error) => {
    console.log("ERROR");
    console.log(error);
    process.exit(1)
});
