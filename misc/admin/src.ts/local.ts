import fs from "fs";

import { dirnames, getPackageJsonPath, getPackagePath, resolve } from "./path";
import { run } from "./run";
import { loadJson, saveJson, sha256, sortRecords } from "./utils";

export type Package = {
    dependencies: { [ name: string ]: string };
    devDependencies: { [ name: string ]: string };
    gitHead: string;
    name: string;
    version: string;
    tarballHash: string;
    location: "remote" | "local";
    _ethers_nobuild: boolean;
};

export function getPackage(name: string): Package {
    const value = loadJson(getPackageJsonPath(name));
    return {
        name: value.name,
        version: value.version,
        dependencies: (value.dependencies || { }),
        devDependencies: (value.dependencies || { }),
        location: "local",
        tarballHash: (value.tarballHash || null),
        gitHead: (value.gitHead || null),
        _ethers_nobuild: !!value._ethers_nobuild,
    };
}

export function updateJson(path: string, replace: Record<string, any>, sort?: boolean): void {
    const values = loadJson(path);

    Object.keys(replace).forEach((key) => {
        const value = replace[key];
        if (value === undefined) {
            delete values[key];
        } else {
            values[key] = replace[key];
        }
    });

    saveJson(path, values, !!sort);
}

export function getDependencies(name?: string, filter?: (name: string) => boolean): Record<string, string> {
    if (name) {
        return sortRecords(getPackage(name).dependencies);
    }

    // Find all versions for each package dependency
    const deps = dirnames.reduce((accum, dirname) => {
        const deps = getPackage(dirname).dependencies;
        Object.keys(deps).forEach((name) => {
            if (filter && !filter(name)) { return; }
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

export function getPackList(name: string): Array<string> {
    const result = run("npm", [ "pack", "--json", getPackagePath(name), "--dry-run" ]);
    if (!result.ok) {
        const error = new Error(`failed to run npm pack: ${ name }`);
        (<any>error).result = result;
        throw error;
    }
    return JSON.parse(result.stdout)[0].files.map((info: { path: string }) => info.path);
}

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
export function computeTarballHash(name: string): string {

    // Sort the files to get a consistent hash
    const files = getPackList(name);
    files.sort();

    // Compute the hash for each file
    const packageRoot = getPackagePath(name);
    const hashes = files.reduce((accum, filename) => {
        let content = fs.readFileSync(resolve(packageRoot, filename));

        // The package.json includes the hash, so we need to nix it to get a consistent hash
        if (filename === "package.json") {
            const info = JSON.parse(content.toString());
            delete info.gitHead;
            delete info.tarballHash;
            content = Buffer.from(JSON.stringify(info, null, 2));
        }

        accum[filename] = sha256(content);
        return accum;
    }, <Record<string, string>>{ });

    return sha256(Buffer.from("{" + files.map((filename) => {
        return `${ JSON.stringify(filename) }:"${ hashes[filename] }"`
    }).join(",") + "}"));
}
