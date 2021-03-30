//import fs from "fs";

import semver from "semver";

import * as local from "../local";
import * as npm from "../npm";
import { dirnames, getPackageJsonPath } from "../path";

(async function() {
    const pNpm = await npm.getPackage("ethers");
    const newVersion = semver.inc(pNpm.version, "minor");

    for (let i = 0; i < dirnames.length; i++) {
        const dirname = dirnames[i];
        const pLocal = local.getPackage(dirname);

        const deps = Object.keys(pLocal.dependencies).reduce((accum, name) => {
            let version = pLocal.dependencies[name];

            const prefix = name.split("/")[0];
            if (dirname === "ethers") {
                if (prefix === "@ethersproject") {
                    if (!version.match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
                        throw new Error(`bad version for bumping: ${ dirname }:${ name }:${ version }`);
                    }
                    version = newVersion;
                }
            } else {
                if (prefix === "ethers" || prefix === "@ethersproject") {
                    if (version.substring(0, 1) !== "^") {
                        throw new Error(`bad version for bumping: ${ dirname }:${ name }:${ version }`);
                    }
                    version = "^" + newVersion;
                }
            }
            accum[name] = version;

            return accum;
        }, <Record<string, string>>{});

        const packageJsonPath = getPackageJsonPath(dirname);
        local.updateJson(packageJsonPath, {
            dependencies: deps,
            version: newVersion
        }, true);
    }
})();
