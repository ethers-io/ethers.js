import fs from "fs";
import { dirname, resolve } from "path";

import { dirs, getDependencies, getDirname, getPackagePath, packages } from "../path";

function link(existing: string, path: string): void {
    try {
        const current = fs.readlinkSync(path);

        // Alerady linked
        if (current === existing) { return; }

        fs.unlinkSync(path);
    } catch (error) {
        if (error.code !== "ENOENT") { throw error; }
    }

    // Link
    const dir = dirname(path);
    fs.mkdirSync(dir, { recursive: true });
    fs.symlinkSync(existing, path);
}

(async function() {
    const nodeModulesBase = resolve(dirs.root, ".package_node_modules");

    // Make a symlink in the ROOT/node_mpdules to each package in this repo
    packages.forEach((name) => {

        // e.g. /node_modules/@ethersproject/abi => /packages/abi
        link(getPackagePath(name), resolve(dirs.root, "node_modules", name));

        // e.g. /packages/abi/node_modules => /.package_node_modules/abi/
        const nodeModules = resolve(nodeModulesBase, getDirname(name));
        fs.mkdirSync(nodeModules, { recursive: true });
        link(nodeModules, resolve(getPackagePath(name), "node_modules"));
    });

    packages.forEach((name) => {
        const nodeModules = resolve(nodeModulesBase, getDirname(name));

        const deps = getDependencies(name);
        Object.keys(deps).forEach((name) => {
            link(resolve(dirs.root, "node_modules", name), resolve(nodeModules, name));
        });
    });

})();
