"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
exports.root = path_1.resolve(__dirname, "../../../");
const pathRootPackageJsonPath = path_1.resolve(exports.root, "package.json");
const pathPackages = path_1.resolve(exports.root, "packages");
exports.dirs = Object.freeze({
    rootPackageJsonPath: pathRootPackageJsonPath,
    packages: pathPackages,
    root: exports.root,
});
exports.dirnames = Object.freeze(fs_1.default.readdirSync(exports.dirs.packages));
const packageLookup = exports.dirnames.reduce((accum, dirname) => {
    const packagePath = path_1.resolve(exports.dirs.packages, dirname);
    const packageJsonPath = path_1.resolve(packagePath, "package.json");
    const info = JSON.parse(fs_1.default.readFileSync(packageJsonPath).toString());
    const packageName = info.name;
    const version = info.version;
    accum[packageName] = accum[dirname] = {
        dirname, packageName, packagePath, packageJsonPath, version
    };
    return accum;
}, {});
exports.packages = Object.freeze(exports.dirnames.map((dirname) => packageLookup[dirname].packageName));
function atomicWrite(path, value) {
    const tmp = path_1.resolve(exports.dirs.root, ".atomic-tmp");
    fs_1.default.writeFileSync(tmp, value);
    fs_1.default.renameSync(tmp, path);
}
exports.atomicWrite = atomicWrite;
function loadJson(path) {
    return JSON.parse(fs_1.default.readFileSync(path).toString());
}
exports.loadJson = loadJson;
function getPackageInfo(name) {
    const value = packageLookup[name];
    if (!value) {
        throw new Error(`unknown package: ${name}`);
    }
    return value;
}
function getPackagePath(name) {
    return getPackageInfo(name).packagePath;
}
exports.getPackagePath = getPackagePath;
function getDirname(name) {
    return getPackageInfo(name).dirname;
}
exports.getDirname = getDirname;
function getPackageJsonPath(name) {
    return getPackageInfo(name).packageJsonPath;
}
exports.getPackageJsonPath = getPackageJsonPath;
function getPackage(name) {
    const value = loadJson(getPackageJsonPath(name));
    return {
        name: value.name,
        version: value.version,
        dependencies: (value.dependencies || {}),
        devDependencies: (value.dependencies || {}),
    };
}
exports.getPackage = getPackage;
function sortRecords(record) {
    const keys = Object.keys(record);
    keys.sort();
    return keys.reduce((accum, name) => {
        accum[name] = record[name];
        return accum;
    }, {});
}
function getDependencies(name) {
    if (name) {
        return sortRecords(getPackage(name).dependencies);
    }
    // Find all versions for each package dependency
    const deps = exports.dirnames.reduce((accum, dirname) => {
        const deps = getPackage(dirname).dependencies;
        Object.keys(deps).forEach((name) => {
            if (!accum[name]) {
                accum[name] = {};
            }
            accum[name][deps[name]] = true;
        });
        return accum;
    }, {});
    // Make sure each package dependency only has 1 version
    return sortRecords(Object.keys(deps).reduce((accum, name) => {
        const versions = Object.keys(deps[name]);
        if (versions.length > 1) {
            throw new Error(`cannot depend on multiple versions for ${JSON.stringify(name)}: ${versions.map(v => JSON.stringify(v)).join(", ")}`);
        }
        accum[name] = versions[0];
        return accum;
    }, {}));
}
exports.getDependencies = getDependencies;
function isEthers(name) {
    return !!packageLookup[name];
}
exports.isEthers = isEthers;
function updateJson(path, replace, sort) {
    const values = loadJson(path);
    Object.keys(replace).forEach((key) => {
        values[key] = replace[key];
    });
    let replacer = null;
    if (sort) {
        replacer = (key, value) => {
            if (typeof (value) === "object") {
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
    atomicWrite(path, JSON.stringify(values, replacer, 2));
}
exports.updateJson = updateJson;
