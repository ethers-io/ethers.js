"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const root = path_1.resolve(".");
function loadJson(path) {
    return JSON.parse(fs_1.default.readFileSync(path).toString());
}
function atomicWrite(path, value) {
    const tmp = path_1.resolve(root, ".atomic-tmp");
    fs_1.default.writeFileSync(tmp, value);
    fs_1.default.renameSync(tmp, path);
}
function saveJson(filename, data, sort) {
    let replacer = undefined;
    if (sort) {
        replacer = (key, value) => {
            if (Array.isArray(value)) {
                // pass
            }
            else if (value && typeof (value) === "object") {
                const keys = Object.keys(value);
                keys.sort();
                return keys.reduce((accum, key) => {
                    accum[key] = value[key];
                    return accum;
                }, {});
            }
            return value;
        };
    }
    atomicWrite(filename, JSON.stringify(data, replacer, 2) + "\n");
}
(function () {
    const filename = path_1.resolve(root, "package.json");
    const pkg = loadJson(filename);
    const packageFolder = (pkg.reticulate || {}).pacakges || "packages";
    {
        // @TODO: Check within root
    }
    const pkgs = fs_1.default.readdirSync(packageFolder).reduce((accum, folder) => {
        const pkg = loadJson(path_1.resolve(root, packageFolder, folder, "package.json"));
        if (accum[pkg.name]) {
            throw new Error(`duplicate package named ${pkg.name}`);
        }
        accum[pkg.name] = pkg.dependencies || {};
        return accum;
    }, {});
    const result = {};
    Object.keys(pkgs).forEach((name) => {
        const versions = pkgs[name];
        for (const dep in versions) {
            // This package is managed by this monorepo
            if (dep in pkgs) {
                continue;
            }
            // The required dependency version
            const ver = versions[dep];
            // This already exists in the result...
            const existing = result[dep];
            if (existing) {
                // ...but doesn't match
                if (existing !== ver) {
                    throw new Error(`package dependency version mismatch: ${dep}`);
                }
            }
            else {
                result[dep] = ver;
            }
        }
    });
    console.log(`Hoisting ${Object.keys(result).length} dependencies from ${packageFolder}/*/package.json...\n`);
    pkg.dependencies = result;
    saveJson(filename, pkg, true);
})();
//# sourceMappingURL=bootstrap-hoist.js.map