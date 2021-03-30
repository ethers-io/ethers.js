import fs from "fs";

import semver from "semver";

import { dirnames, getPackageJsonPath, getPackagePath, resolve } from "../path";
import * as local from "../local";
import { colorify, getProgressBar } from "../log";
import * as npm from "../npm";
import { loadJson, repeat, saveJson } from "../utils";

(async function() {
    const common = loadJson(resolve("package.json")).common;

    const progress = getProgressBar(colorify.bold("Bumping package.json versions"));

    const latestVersions: Record<string, string> = { };
    let updated = false;

    const output: Array<string> = [ ];

    // For each package, detect diff between tarball and remote
    for (let i = 0; i < dirnames.length; i++) {
        progress(i / dirnames.length);

        const dirname = dirnames[i];
        const packageJsonPath = getPackageJsonPath(dirname);

        // Set the common elements to the package.json
        local.updateJson(packageJsonPath, common, true);

        const pLocal = local.getPackage(dirname);
        const pNpm = await npm.getPackage(dirname);

        const tarballHash = local.computeTarballHash(dirname);

        let version = pNpm.version;

        if (tarballHash !== pNpm.tarballHash) {
            if (semver.gt(pLocal.version, version)) {
                // Already have a more recent version locally
                version = pLocal.version;
            } else {
                // Bump the patch version from NPM
                version = semver.inc(version, "patch");
            }

            output.push([
                "  ",
                colorify.blue(pLocal.name),
                repeat(" ", 47 - pLocal.name.length - pNpm.version.length),
                pNpm.version,
                colorify.bold(" => "),
                colorify.green(version)
            ].join(""));

            local.updateJson(packageJsonPath, { gitHead: undefined, tarballHash, version }, true);

            updated = true;
        }

        latestVersions[pLocal.name] = version;

        // Write out the _version.ts
        if (!pLocal._ethers_nobuild) {
            const code = "export const version = " + JSON.stringify(dirname + "/" + version) + ";\n";
            fs.writeFileSync(resolve(getPackagePath(dirname), "src.ts/_version.ts"), code);
        }
    }
    progress(1);

    if (updated) {
        const filename = resolve("packages/ethers/package.json")
        const info = loadJson(filename);
        Object.keys(info.dependencies).forEach((name) => {
            const version = latestVersions[name];
            if (name == null) { return; }
            info.dependencies[name] = version;
        });
        saveJson(filename, info);
    }

    output.forEach((line) => { console.log(line); });

})().then((result) => {
    // Something above causes this script to hang, so let's exit manually
    setTimeout(() => {
        process.exit(0);
    }, 1000);
}, (error) => {
    console.log(`Error running ${ process.argv[0] }: ${ error.message }`);
    process.exit(1);
});
