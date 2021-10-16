"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEthers = exports.getPackageJsonPath = exports.getDirname = exports.getPackagePath = exports.packages = exports.dirnames = exports.dirs = exports.resolve = exports.root = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
exports.root = (0, path_1.resolve)(__dirname, "../../../");
function resolve(...args) {
    args.unshift(exports.root);
    return path_1.resolve.apply(null, args);
}
exports.resolve = resolve;
const pathRootPackageJsonPath = resolve("package.json");
const pathPackages = resolve("packages");
exports.dirs = Object.freeze({
    rootPackageJsonPath: pathRootPackageJsonPath,
    packages: pathPackages,
    root: exports.root,
});
exports.dirnames = Object.freeze(fs_1.default.readdirSync(exports.dirs.packages).filter((dirname) => {
    return (dirname[0] !== ".");
}));
const packageLookup = exports.dirnames.reduce((accum, dirname) => {
    const packagePath = (0, path_1.resolve)(exports.dirs.packages, dirname);
    const packageJsonPath = (0, path_1.resolve)(packagePath, "package.json");
    const info = JSON.parse(fs_1.default.readFileSync(packageJsonPath).toString());
    const packageName = info.name;
    const version = info.version;
    accum[packageName] = accum[dirname] = {
        dirname, packageName, packagePath, packageJsonPath, version
    };
    return accum;
}, {});
exports.packages = Object.freeze(exports.dirnames.map((dirname) => packageLookup[dirname].packageName));
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
function isEthers(name) {
    return !!packageLookup[name];
}
exports.isEthers = isEthers;
