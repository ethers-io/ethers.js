
import { Options, publish as npmPublish } from "libnpmpublish";
import semver from "semver";

import { getUrl } from "./geturl";
import * as local from "./local";
import {colorify, getProgressBar, getPrompt} from "./log";
import {getOrdered} from "./depgraph";
import {resolve} from "./path";
import {getGitTag} from "./git";
import {loadJson, repeat} from "./utils";
import {config} from "./config";


const cache: Record<string, any> = { };

async function getPackageInfo(name: string): Promise<any> {
    // Convert dirname to package if needed
    name = local.getPackage(name).name;

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

export async function getPackage(name: string, version?: string): Promise<local.Package> {
    const infos = await getPackageInfo(name);
    if (infos == null || infos.error) { return null; }

    if (version == null) {
        const versions = Object.keys(infos.versions);
        versions.sort(semver.compare);
        version = versions.pop();
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

export async function _publish(path: string, manifest: any, options: Options): Promise<void> {
    try {
        await npmPublish(path, manifest, options);

    } catch (error) {

        // We need an OTP
        if (error.code === "EOTP") {
            const otp = await getPrompt(colorify.bold("Enter OTP: "));
            options.otp = otp.replace(" ", "");

            // Retry with the new OTP
            return await _publish(path, manifest, options);
        }
        throw error;
    }
}

export async function getPublishOptions() {
    const dirnames = getOrdered();

    // @TODO: Fail if there are any untracked files or unchecked in files

    const publishPackages: Record<string, { name: string, gitHead: string, oldVersion: string, newVersion: string }> = {};

    const progressUpdate = getProgressBar(colorify.bold("Finding updated packages..."));
    for (let i = 0; i < dirnames.length; i++) {
        progressUpdate(i / dirnames.length);

        let dirname = dirnames[i];

        let info = local.getPackage(dirname);

        let npmInfo;
        try {
            npmInfo = await getPackage(dirname);

            // No change in version, no need to publish
            if (npmInfo && info.version === npmInfo.version) {
                // continue;
            }

            if (dirname === "testcases" || dirname === "tests") {
                continue;
            }
        } catch (err) {
            console.error(err);
        }


        // Get the latest commit this package was modified at
        const path = resolve("packages", dirname);
        const gitHead = await getGitTag(path);
        if (gitHead == null) {
            throw new Error("hmmm...");
        }

        publishPackages[dirname] = {
            name: info.name,
            gitHead: gitHead,
            oldVersion: (npmInfo && npmInfo.version ? npmInfo.version : "NEW"),
            newVersion: info.version
        };
    }
    progressUpdate(1);

    console.log(colorify.bold(`Found ${Object.keys(publishPackages).length} updated pacakges...`));
    Object.keys(publishPackages).forEach((dirname) => {
        const info = publishPackages[dirname];
        console.log(`  ${colorify.blue(info.name)} ${repeat(" ", 50 - info.name.length - info.oldVersion.length)} ${info.oldVersion} ${colorify.bold("=>")} ${colorify.green(info.newVersion)}`);
    });

    const publishNames = Object.keys(publishPackages);
    publishNames.sort((a, b) => (dirnames.indexOf(a) - dirnames.indexOf(b)));
    return {publishNames, publishPackages};
}

const USER_AGENT = "hethers-dist@0.0.1";
const TAG = "latest";
type PublishScriptModes = 'manual' | 'auto';
export async function publishAll(mode:PublishScriptModes = 'manual'): Promise<void> {
    const {publishNames, publishPackages} = await getPublishOptions();

    // Load the token from the encrypted store
    const options: Record<string, string> = {
        access: "public",
        npmVersion: USER_AGENT,
        tag: TAG
    };

    if (mode === 'manual') {
        try {
            const token = (await config.get("npm-token")).trim().split("=");
            options[token[0]] = token[1];
        } catch (error) {
            switch (error.message) {
                case "wrong password":
                    console.log(colorify.bold("Wrong password"));
                    break;
                case "cancelled":
                    break;
                default:
                    console.log(error);
            }

            console.log(colorify.red("Aborting."));
            return;
        }
    }
    else {
        options['token'] = process.env['NPM_TOKEN'];
    }

    console.log(colorify.bold("Publishing:"));
    for (let i = 0; i < publishNames.length; i++) {
        const dirname = publishNames[i];
        const path = resolve("packages", dirname);
        const pathJson = resolve("packages", dirname, "package.json");

        const { gitHead, name, newVersion } = publishPackages[dirname];
        console.log(`  ${ colorify.blue(name) } @ ${ colorify.green(newVersion) }`);

        local.updateJson(pathJson, { gitHead: gitHead }, true);
        const info = loadJson(pathJson);

        await _publish(path, info, options);
        local.updateJson(pathJson, { gitHead: undefined }, true);
    }

}