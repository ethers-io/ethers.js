import fs from "fs";
import { resolve } from "path";

export const root: string = resolve(__dirname, "../../../");

const pathRootPackageJsonPath: string = resolve(root, "package.json");
const pathPackages: string = resolve(root, "packages");

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

export type Package = {
    dependencies: { [ name: string ]: string };
    devDependencies: { [ name: string ]: string };
    name: string;
    version: string;
};

export const dirnames: ReadonlyArray<string> = Object.freeze(fs.readdirSync(dirs.packages));

const packageLookup = dirnames.reduce((accum, dirname) => {
    const packagePath = resolve(dirs.packages, dirname);
    const packageJsonPath = resolve(packagePath, "package.json");

    const info = JSON.parse(fs.readFileSync(packageJsonPath).toString());
    const packageName = info.name;
    const version = info.version;

    accum[packageName] = accum[dirname] = {
        dirname, packageName, packagePath, packageJsonPath, version
    };

    return accum;
}, <{ [ name: string ]: PackageInfo }>{ });

export const packages: ReadonlyArray<string> = Object.freeze(dirnames.map((dirname) => packageLookup[dirname].packageName));

export function atomicWrite(path: string, value: string | Uint8Array): void {
    const tmp = resolve(dirs.root, ".atomic-tmp");
    fs.writeFileSync(tmp, value);
    fs.renameSync(tmp, path);
}

export function loadJson(path: string): any {
    return JSON.parse(fs.readFileSync(path).toString());
}

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

export function getPackage(name: string): Package {
    const value = loadJson(getPackageJsonPath(name));
    return {
        name: value.name,
        version: value.version,
        dependencies: (value.dependencies || { }),
        devDependencies: (value.dependencies || { }),
    };
}

function sortRecords(record: Record<string, any>): Record<string, any> {
    const keys = Object.keys(record);
    keys.sort();

    return keys.reduce((accum, name) => {
        accum[name] = record[name];
        return accum;
    }, <Record<string, any>>{ });
}

export function getDependencies(name?: string): Record<string, string> {
    if (name) {
        return sortRecords(getPackage(name).dependencies);
    }

    // Find all versions for each package dependency
    const deps = dirnames.reduce((accum, dirname) => {
        const deps = getPackage(dirname).dependencies;
        Object.keys(deps).forEach((name) => {
            if (!accum[name]) { accum[name] = { }; }
            accum[name][deps[name]] = true;
        });
        return accum;
    }, <Record<string, Record<string, boolean>>>{});

    // Make sure each package dependency only has 1 version
    return sortRecords(Object.keys(deps).reduce((accum, name) => {
        const versions = Object.keys(deps[name]);
        if (versions.length > 1) {
            throw new Error(`cannot depend on multiple versions for ${ JSON.stringify(name) }: ${ versions.map(v => JSON.stringify(v)).join(", ") }`);
        }
        accum[name] = versions[0];
        return accum;
    }, <Record<string, string>>{ }));
}

export function isEthers(name: string) {
    return !!packageLookup[name];
}

export function updateJson(path: string, replace: Record<string, any>, sort?: boolean): void {
    const values = loadJson(path);
    Object.keys(replace).forEach((key) => {
        values[key] = replace[key];
    });

    let replacer: (key: string, value: any) => any = null;
    if (sort) {
        replacer = (key, value) => {
            if (typeof(value) === "object") {
                const keys = Object.keys(value);
                keys.sort();
                return keys.reduce((accum, key) => {
                    accum[key] = value[key];
                    return accum;
                }, <Record<string, any>>{});
            }
            return value;
        };
    }

    atomicWrite(path, JSON.stringify(values, replacer, 2));
}
