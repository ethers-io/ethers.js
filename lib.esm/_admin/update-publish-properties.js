import fs from "fs";
import semver from "semver";
import { keccak256 } from "../crypto/index.js";
import { FetchRequest } from "../utils/index.js";
import { loadJson, saveJson } from "./utils/json.js";
import { getGitTag } from "./utils/git.js";
import { resolve } from "./utils/path.js";
import { run } from "./utils/run.js";
const cache = {};
async function getNpmPackage(name) {
    if (!cache[name]) {
        const resp = await (new FetchRequest("https:/\/registry.npmjs.org/" + name)).send();
        resp.assertOk();
        cache[name] = resp.bodyJson;
    }
    return cache[name] || null;
}
function getPackList() {
    const result = run("npm", ["pack", "--json", resolve("."), "--dry-run"]);
    if (!result.ok) {
        const error = new Error("failed to run npm pack");
        error.result = result;
        throw error;
    }
    return JSON.parse(result.stdout)[0].files.map((info) => info.path);
}
function computeTarballHash() {
    // Sort the files to get a consistent hash
    const files = getPackList();
    files.sort();
    const hashes = files.reduce((accum, filename) => {
        let content = fs.readFileSync(resolve(filename));
        // The package.json includes the hash, so we need to normalize it first
        if (filename === "package.json") {
            const info = JSON.parse(content.toString());
            delete info.gitHead;
            delete info.tarballHash;
            content = Buffer.from(JSON.stringify(info, null, 2));
        }
        accum[filename] = keccak256(content);
        return accum;
    }, {});
    return keccak256(Buffer.from("{" + files.map((filename) => {
        return `${JSON.stringify(filename)}:"${hashes[filename]}"`;
    }).join(",") + "}"));
}
(async function () {
    // Local pkg
    const pkgPath = resolve("package.json");
    const pkgInfo = loadJson(pkgPath);
    const tag = pkgInfo.publishConfig.tag;
    // Get the remote version that matches our dist-tag
    const remoteInfo = await getNpmPackage(pkgInfo.name);
    const remoteVersion = remoteInfo["dist-tags"][tag];
    // Remote pkg
    const remotePkgInfo = remoteInfo.versions[remoteVersion];
    // Compute the populated values
    const tarballHash = computeTarballHash();
    const gitHead = await getGitTag(resolve("."));
    if (remotePkgInfo.tarballHash !== tarballHash) {
        pkgInfo.tarballHash = tarballHash;
        pkgInfo.gitHead = gitHead;
        if (tag.indexOf("beta") >= 0) {
            // Still a beta branch; advance the beta version
            const prerelease = semver.prerelease(remoteVersion);
            if (prerelease == null || prerelease.length !== 2) {
                throw new Error("no prerelease found");
            }
            pkgInfo.version = semver.inc(remoteVersion, "prerelease", String(prerelease[0]));
        }
        else if (semver.minor(remoteVersion) == semver.minor(pkgInfo.version)) {
            // If we want to bump the minor version, it was done explicitly in the pkg
            pkgInfo.version = semver.inc(remoteVersion, "patch");
        }
    }
    saveJson(pkgPath, pkgInfo, true);
})().catch((error) => {
    console.log(error);
});
//# sourceMappingURL=update-publish-properties.js.map