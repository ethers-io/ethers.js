const { createHash } = require("crypto");
import fs from "fs";

import AWS from 'aws-sdk';

import { getLatestChange } from "../changelog";
import { config } from "../config";
import { getOrdered } from "../depgraph";
import { getGitTag } from "../git";
import { createRelease } from "../github";
import * as local from "../local";
import { colorify, getProgressBar } from "../log";
import * as npm from "../npm";
import { resolve } from "../path";
import { loadJson, repeat } from "../utils";

const USER_AGENT = "ethers-dist@0.0.1";
const TAG = "latest";

const forcePublish = (process.argv.slice(2).indexOf("--publish") >= 0);

type PutInfo = {
    ACL: "public-read";
    Body: string | Buffer;
    Bucket: string;
    ContentType: string;
    Key: string;
}

export function putObject(s3: AWS.S3, info: PutInfo): Promise<{ name: string, hash: string }> {
    return new Promise((resolve, reject) => {
        s3.putObject(info, function(error, data) {
            if (error) {
                reject(error);
            } else {
                resolve({
                    name: info.Key,
                    hash: data.ETag.replace(/"/g, '')
                });
            }
        });
    });
}

export function invalidate(cloudfront: AWS.CloudFront, distributionId: string): Promise<string> {
    return new Promise((resolve, reject) => {
        cloudfront.createInvalidation({
            DistributionId: distributionId,
            InvalidationBatch: {
                CallerReference: `${ USER_AGENT }-${ parseInt(String((new Date()).getTime() / 1000)) }`,
                Paths: {
                    Quantity: 1,
                    Items: [
                        "/\*"
                    ]
                }
            }
        }, function(error, data) {
            if (error) {
                console.log(error);
                return;
            }
            resolve(data.Invalidation.Id);
        });
    });
}

(async function() {
    const dirnames = getOrdered();

    // @TODO: Fail if there are any untracked files or unchecked in files

    const publish: Record<string, { name: string, gitHead: string, oldVersion: string, newVersion: string }> = { };

    const progressUpdate = getProgressBar(colorify.bold("Finding updated packages..."));
    for (let i = 0; i < dirnames.length; i++) {
        progressUpdate(i / dirnames.length);

        let dirname = dirnames[i];

        let info = local.getPackage(dirname);
        let npmInfo = await npm.getPackage(dirname);

        // No change in version, no need to publish
        if (info.version === npmInfo.version) { continue; }

        // Get the latest commit this package was modified at
        const path = resolve("packages", dirname);
        const gitHead = await getGitTag(path);
        if (gitHead == null) { throw new Error("hmmm..."); }

        publish[dirname] = {
            name: info.name,
            gitHead: gitHead,
            oldVersion: (npmInfo ? npmInfo.version: "NEW"),
            newVersion: info.version
        };
    }
    progressUpdate(1);

    console.log(colorify.bold(`Found ${ Object.keys(publish).length } updated pacakges...`));
    Object.keys(publish).forEach((dirname) => {
        const info = publish[dirname];
        console.log(`  ${ colorify.blue(info.name) } ${ repeat(" ", 50 - info.name.length - info.oldVersion.length) } ${ info.oldVersion } ${ colorify.bold("=>") } ${ colorify.green(info.newVersion) }`);
    });

    const publishNames = Object.keys(publish);
    publishNames.sort((a, b) => (dirnames.indexOf(a) - dirnames.indexOf(b)));

    // Load the token from the encrypted store
    const options: Record<string, string> = {
        access: "public",
        npmVersion: USER_AGENT,
        tag: TAG
    };

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

    console.log(colorify.bold("Publishing:"));
    for (let i = 0; i < publishNames.length; i++) {
        const dirname = publishNames[i];
        const path = resolve("packages", dirname);
        const pathJson = resolve("packages", dirname, "package.json");

        const { gitHead, name, newVersion } = publish[dirname];
        console.log(`  ${ colorify.blue(name) } @ ${ colorify.green(newVersion) }`);

        local.updateJson(pathJson, { gitHead: gitHead }, true);
        const info = loadJson(pathJson);
        await npm.publish(path, info, options);
        local.updateJson(pathJson, { gitHead: undefined }, true);
    }

    if (publishNames.indexOf("ethers") >= 0 || forcePublish) {
        const change = getLatestChange();

        const patchVersion = change.version.substring(1);
        const minorVersion = patchVersion.split(".").slice(0, 2).join(".")

        const awsAccessId = await config.get("aws-upload-scripts-accesskey");
        const awsSecretKey = await config.get("aws-upload-scripts-secretkey");

        // Publish tagged release on GitHub
        {
            // The password above already succeeded
            const username = await config.get("github-user");
            const password = await config.get("github-release");

            const hash = createHash("sha384").update(fs.readFileSync(resolve("packages/ethers/dist/ethers.umd.min.js"))).digest("base64");

            const gitCommit = await getGitTag(resolve("CHANGELOG.md"));

            let content = change.content.trim();
            content += '\n\n----\n\n';
            content += '**Embedding UMD with [SRI](https:/\/developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity):**\n';
            content += '```html\n';
            content += '<script type="text/javascript"\n';
            content += `        integrity="sha384-${ hash }"\n`;
            content += '        crossorigin="anonymous"\n';
            content += `        src="https:/\/cdn-cors.ethers.io/lib/ethers-${ patchVersion }.umd.min.js">\n`;
            content += '</script>\n';
            content += '```';

            // Publish the release
            const beta = false;
            const link = await createRelease(username, password, change.version, change.title, content, beta, gitCommit);
            console.log(`${ colorify.bold("Published release:") } ${ link }`);
        }

        // Upload libs to the CDN (as ethers-v5.1 and ethers-5.1.x)
        {
            const bucketNameLib = await config.get("aws-upload-scripts-bucket");
            const originRootLib = await config.get("aws-upload-scripts-root");

            const bucketNameCors = await config.get("aws-upload-scripts-bucket-cors");
            const originRootCors = await config.get("aws-upload-scripts-root-cors");

            const s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                accessKeyId: awsAccessId,
                secretAccessKey: awsSecretKey
            });

            // Upload the libs to ethers-v5.1 and ethers-5.1.x
            const fileInfos: Array<{ bucketName: string, originRoot: string, filename: string, key: string, suffix?: string }> = [
                // The CORS-enabled versions on cdn-cors.ethers.io
                {
                    bucketName: bucketNameCors,
                    originRoot: originRootCors,
                    suffix: "-cors",
                    filename: "packages/ethers/dist/ethers.esm.min.js",
                    key: `ethers-${ patchVersion }.esm.min.js`
                },
                {
                    bucketName: bucketNameCors,
                    originRoot: originRootCors,
                    suffix: "-cors",
                    filename: "packages/ethers/dist/ethers.umd.min.js",
                    key: `ethers-${ patchVersion }.umd.min.js`
                },

                // The non-CORS-enabled versions on cdn.ethers.io
                {
                    bucketName: bucketNameLib,
                    originRoot: originRootLib,
                    filename: "packages/ethers/dist/ethers.esm.min.js",
                    key: `ethers-${ patchVersion }.esm.min.js`
                },
                {
                    bucketName: bucketNameLib,
                    originRoot: originRootLib,
                    filename: "packages/ethers/dist/ethers.umd.min.js",
                    key: `ethers-${ patchVersion }.umd.min.js`
                },
                {
                    bucketName: bucketNameLib,
                    originRoot: originRootLib,
                    filename: "packages/ethers/dist/ethers.esm.min.js",
                    key: `ethers-${ minorVersion }.esm.min.js`
                },
                {
                    bucketName: bucketNameLib,
                    originRoot: originRootLib,
                    filename: "packages/ethers/dist/ethers.umd.min.js",
                    key: `ethers-${ minorVersion }.umd.min.js`
                },
            ];

            for (let i = 0; i < fileInfos.length; i++) {
                const { bucketName, originRoot, filename, key, suffix } = fileInfos[i];
                await putObject(s3, {
                    ACL: "public-read",
                    Body: fs.readFileSync(resolve(filename)),
                    Bucket: bucketName,
                    ContentType: "application/javascript; charset=utf-8",
                    Key: (originRoot + key)
                });
                console.log(`${ colorify.bold("Uploaded:") } https://cdn${ suffix || "" }.ethers.io/lib/${ key }`);
            }
        }

        // Flush the edge caches
        {
            const distributionId = await config.get("aws-upload-scripts-distribution-id");

            const cloudfront = new AWS.CloudFront({
                //apiVersion: '2006-03-01',
                accessKeyId: awsAccessId,
                secretAccessKey: awsSecretKey
            });
            const invalidationId = await invalidate(cloudfront, distributionId);
            console.log(`${ colorify.bold("Invalidating Edge Cache:") } ${ invalidationId }`);
        }
    }
})();
