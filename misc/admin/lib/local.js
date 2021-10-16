"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTarballHash = exports.getPackList = exports.getDependencies = exports.updateJson = exports.getPackage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("./path");
const run_1 = require("./run");
const utils_1 = require("./utils");
function getPackage(name) {
    const value = (0, utils_1.loadJson)((0, path_1.getPackageJsonPath)(name));
    return {
        name: value.name,
        version: value.version,
        dependencies: (value.dependencies || {}),
        devDependencies: (value.dependencies || {}),
        location: "local",
        tarballHash: (value.tarballHash || null),
        gitHead: (value.gitHead || null),
        _ethers_nobuild: !!value._ethers_nobuild,
    };
}
exports.getPackage = getPackage;
function updateJson(path, replace, sort) {
    const values = (0, utils_1.loadJson)(path);
    Object.keys(replace).forEach((key) => {
        const value = replace[key];
        if (value === undefined) {
            delete values[key];
        }
        else {
            values[key] = replace[key];
        }
    });
    (0, utils_1.saveJson)(path, values, !!sort);
}
exports.updateJson = updateJson;
function getDependencies(name, filter) {
    if (name) {
        return (0, utils_1.sortRecords)(getPackage(name).dependencies);
    }
    // Find all versions for each package dependency
    const deps = path_1.dirnames.reduce((accum, dirname) => {
        const deps = getPackage(dirname).dependencies;
        Object.keys(deps).forEach((name) => {
            if (filter && !filter(name)) {
                return;
            }
            if (!accum[name]) {
                accum[name] = {};
            }
            accum[name][deps[name]] = true;
        });
        return accum;
    }, {});
    // Make sure each package dependency only has 1 version
    return (0, utils_1.sortRecords)(Object.keys(deps).reduce((accum, name) => {
        const versions = Object.keys(deps[name]);
        if (versions.length > 1) {
            throw new Error(`cannot depend on multiple versions for ${JSON.stringify(name)}: ${versions.map(v => JSON.stringify(v)).join(", ")}`);
        }
        accum[name] = versions[0];
        return accum;
    }, {}));
}
exports.getDependencies = getDependencies;
function getPackList(name) {
    const result = (0, run_1.run)("npm", ["pack", "--json", (0, path_1.getPackagePath)(name), "--dry-run"]);
    if (!result.ok) {
        const error = new Error(`failed to run npm pack: ${name}`);
        error.result = result;
        throw error;
    }
    return JSON.parse(result.stdout)[0].files.map((info) => info.path);
}
exports.getPackList = getPackList;
/*
export function getTarball(name: string): Buffer {
    const files = getPackList(name).map((name) => `./${ name }`);
    files.sort((a, b) => {

        const compsA = a.split("/"), compsB = b.split("/");
        while (true) {
            const a = compsA.shift(), b = compsB.shift();
            if (a === b) { continue; }

            if (compsA.length === 0 && compsB.length === 0) {
                if (a < b) { return -1; }
                if (a > b) { return 1; }
                break;
            }

            if (compsA.length === 0) { return -1; }
            if (compsB.length === 0) { return 1; }

            if (a < b) { return -1; }
            if (a > b) { return 1; }
        }

        return 0;
    });

    return tar.create({
        sync: true,
        cwd: getPackagePath(name),
        prefix: "package/",
        gzip: true,
        portable: true,
        // Provide a specific date in the 1980s for the benefit of zip,
        // which is confounded by files dated at the Unix epoch 0.
        mtime: new Date('1985-10-26T08:15:00.000Z'),
    }, files).read();
}
*/
function computeTarballHash(name) {
    // Sort the files to get a consistent hash
    const files = getPackList(name);
    files.sort();
    // Compute the hash for each file
    const packageRoot = (0, path_1.getPackagePath)(name);
    const hashes = files.reduce((accum, filename) => {
        let content = fs_1.default.readFileSync((0, path_1.resolve)(packageRoot, filename));
        // The package.json includes the hash, so we need to nix it to get a consistent hash
        if (filename === "package.json") {
            const info = JSON.parse(content.toString());
            delete info.gitHead;
            delete info.tarballHash;
            content = Buffer.from(JSON.stringify(info, null, 2));
        }
        accum[filename] = (0, utils_1.sha256)(content);
        return accum;
    }, {});
    return (0, utils_1.sha256)(Buffer.from("{" + files.map((filename) => {
        return `${JSON.stringify(filename)}:"${hashes[filename]}"`;
    }).join(",") + "}"));
}
exports.computeTarballHash = computeTarballHash;
