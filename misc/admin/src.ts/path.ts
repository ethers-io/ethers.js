import fs from "fs";
import { resolve as _resolve } from "path";

export const root: string = _resolve(__dirname, "../../../");

export function resolve(...args: Array<string>): string {
    args.unshift(root);
    return _resolve.apply(null, args);
}

const pathRootPackageJsonPath: string = resolve("package.json");
const pathPackages: string = resolve("packages");

export const dirs = Object.freeze({
    rootPackageJsonPath: pathRootPackageJsonPath,
    packages: pathPackages,
    root,
});


type PackageInfo = {
    dirname: string;
    packageName: string;
    packagePath: string;
    packageJsonPath: string;
    version: string;
};

export const dirnames: ReadonlyArray<string> = Object.freeze(fs.readdirSync(dirs.packages).filter((dirname) => {
    return (dirname[0] !== ".");
}));

const packageLookup = dirnames.reduce((accum, dirname) => {
    const packagePath = _resolve(dirs.packages, dirname);
    const packageJsonPath = _resolve(packagePath, "package.json");

    const info = JSON.parse(fs.readFileSync(packageJsonPath).toString());
    const packageName = info.name;
    const version = info.version;

    accum[packageName] = accum[dirname] = {
        dirname, packageName, packagePath, packageJsonPath, version
    };

    return accum;
}, <{ [ name: string ]: PackageInfo }>{ });

export const packages: ReadonlyArray<string> = Object.freeze(dirnames.map((dirname) => packageLookup[dirname].packageName));

function getPackageInfo(name: string): PackageInfo {
    const value = packageLookup[name];
    if (!value) { throw new Error(`unknown package: ${ name }`); }
    return value;
}

export function getPackagePath(name: string): string {
    return getPackageInfo(name).packagePath;
}

export function getDirname(name: string): string {
    return getPackageInfo(name).dirname;
}

export function getPackageJsonPath(name: string): string {
    return getPackageInfo(name).packageJsonPath;
}

export function isEthers(name: string) {
    return !!packageLookup[name];
}
