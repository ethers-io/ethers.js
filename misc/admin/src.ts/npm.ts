
import { Options, publish as npmPublish } from "libnpmpublish";
import semver from "semver";

import { getUrl } from "./geturl";
import { Package, getPackage as _getPackage } from "./local";
import { colorify, getPrompt } from "./log";


const cache: Record<string, any> = { };

async function getPackageInfo(name: string): Promise<any> {
    // Convert dirname to package if needed
    name = _getPackage(name).name;

    if (!cache[name]) {
        try {
            const result = await getUrl("https:/\/registry.npmjs.org/" + name);
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

        // HACK: So v5 continues working while v6 is managed by reticulate
        version = "6.0.0";
        while (version.indexOf("beta") >= 0 || semver.gte(version, "6.0.0")) {
            version = versions.pop();
        }
    }

    const info = infos.versions[version];

    return {
        dependencies: (info.dependencies || {}),
        devDependencies: (info.devDependencies || {}),
        gitHead: info.gitHead,
        location: "remote",
        name: info.name,
        tarballHash: info.tarballHash,
        version : info.version,
        _ethers_nobuild: !!info._ethers_nobuild,
    };
}

export async function publish(path: string, manifest: any, options: Options): Promise<void> {
    try {
        await npmPublish(path, manifest, options);

    } catch (error) {

        // We need an OTP
        if (error.code === "EOTP") {
            const otp = await getPrompt(colorify.bold("Enter OTP: "));
            options.otp = otp.replace(" ", "");

            // Retry with the new OTP
            return await publish(path, manifest, options);
        }
        throw error;
    }
}
