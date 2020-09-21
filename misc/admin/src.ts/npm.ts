
import semver from "semver";

import { getUrl } from "./geturl";
import { Package, getPackage as _getPackage } from "./local";


const cache: Record<string, any> = { };

async function getPackageInfo(name: string): Promise<any> {
    // Convert dirname to package if needed
    name = _getPackage(name).name;

    if (!cache[name]) {
        try {
            const result = await getUrl("http:/" + "/registry.npmjs.org/" + name);
            cache[name] = JSON.parse(Buffer.from(result.body).toString("utf8"));
        } catch (error) {
            if (error.status === 404) { return null; }
            throw error;
        }
    }
    return cache[name] || null;
}

export async function getPackage(name: string, version?: string): Promise<Package> {
    const infos = await getPackageInfo(name);
    if (infos == null) { return null; }

    if (version == null) {
        const versions = Object.keys(infos.versions);
        versions.sort(semver.compare);
        version = versions.pop();
    }

    const info = infos.versions[version];

    return {
        dependencies: (info.dependencies || {}),
        devDependencies: (info.devDependencies || {}),
        location: "remote",
        name: info.name,
        tarballHash: info.tarballHash,
        version : info.version,
        _ethers_nobuild: !!info._ethers_nobuild,
    };
}
