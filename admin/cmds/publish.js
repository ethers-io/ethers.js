"use strict";

const { basename, resolve } = require("path");
const fs = require("fs");

const AWS = require('aws-sdk');

const config = require("../config");

const { ChangelogPath, latestChange } = require("../changelog");
const { getOrdered, loadPackage } = require("../depgraph");
const { getGitTag } = require("../git");
const { createRelease } = require("../github");
const { getPackageVersion, publish } = require("../npm");
const { log } = require("../log");

const USER_AGENT = "ethers-dist@0.0.0";
const TAG = "latest";


let dirnames = getOrdered();

// Only publish specific packages
if (process.argv.length > 2) {
    let filter = process.argv.slice(2);

    // Verify all named packages exist
    filter.forEach((dirname) => {
        try {
            loadPackage(dirname);
        } catch (error) {
            console.log("Package not found: " + dirname);
            process.exit(1);
        }
    });

    // Filter out pacakges we don't care about
    dirnames = dirnames.filter((dirname) => (filter.indexOf(dirname) >= 0));
}


function putObject(s3, info) {
    return new Promise(function(resolve, reject) {
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

function invalidate(cloudfront, distributionId) {
    return new Promise((resolve, reject) => {
        cloudfront.createInvalidation({
            DistributionId: distributionId,
            InvalidationBatch: {
                CallerReference: `${ USER_AGENT }-${ parseInt(((new Date()).getTime()) / 1000) }`,
                Paths: {
                    Quantity: "1",
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
    let token = null;

    const gitCommit = await getGitTag(ChangelogPath);

    let includeEthers = false;

    // @TODO: Fail if there are any untracked files or unchecked in files

    // Load the token from the encrypted store
    try {
        token = await config.get("npm-token");
    } catch (error) {
        switch (error.message) {
            case "wrong password":
                log("<bold:Wrong password>");
                break;
            case "cancelled":
                break;
            default:
                console.log(error);
        }

        log("<red:Aborting.>");

        return;
    }

    token = token.trim().split("=");

    let options = {
        npmVersion: USER_AGENT,
        tag: TAG
    };

    // Set the authentication token
    options[token[0]] = token[1];

    for (let i = 0; i < dirnames.length; i++) {
        let dirname = dirnames[i];

        if (dirname === "ethers") {
            includeEthers = true;
        }

        let info = loadPackage(dirname);
        let npmInfo = await getPackageVersion(info.name);
        if (!npmInfo) { npmInfo = { version: "NEW" }; }

        if (info.tarballHash === npmInfo.tarballHash) { continue; }

        log(`<bold:Publishing:> ${info.name}...`);
        log(`  <blue:Version:> ${npmInfo.version} <bold:=\\>> ${info.version}`);

        let success = await publish(dirname, options);
        if (!success) {
            log("  <red:FAILED! Aborting.>");
            return;
        }
        log("  <green:Done.>");
    }

    // Publish the GitHub release
    const beta = false;
    if (includeEthers) {

        // Get the latest change from the changelog
        const change = latestChange();

        // Publish the release to GitHub
        {
            // The password above already succeeded
            const username = await config.get("github-user");
            const password = await config.get("github-release");


            // Publish the release
            const link = await createRelease(username, password, change.version, change.title, change.content, beta, gitCommit);
            log(`<bold:Published Release:> ${ link }`);
        }

        // Upload the scripts to the CDN and refresh the edge caches
        {
            const awsAccessId = await config.get("aws-upload-scripts-accesskey");
            const awsSecretKey = await config.get("aws-upload-scripts-secretkey");
            const bucketName = await config.get("aws-upload-scripts-bucket");
            const originRoot = await config.get("aws-upload-scripts-root");
            const distributionId = await config.get("aws-upload-scripts-distribution-id");

            const s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                accessKeyId: awsAccessId,
                secretAccessKey: awsSecretKey
            });

            // Upload the libs to ethers-v5.0 and ethers-5.0.x
            const fileInfos = [
                { filename: "packages/ethers/dist/ethers.esm.min.js", key: `ethers-${ change.version.substring(1) }.esm.min.js` },
                { filename: "packages/ethers/dist/ethers.umd.min.js", key: `ethers-${ change.version.substring(1) }.umd.min.js` },
                { filename: "packages/ethers/dist/ethers.esm.min.js", key: `ethers-5.0.esm.min.js` },
                { filename: "packages/ethers/dist/ethers.umd.min.js", key: `ethers-5.0.umd.min.js` },
            ];

            for (let i = 0; i < fileInfos.length; i++) {
                const fileInfo = fileInfos[i];
                const status = await putObject(s3, {
                    ACL: 'public-read',
                    Body: fs.readFileSync(resolve(__dirname, "../../", fileInfo.filename)),
                    Bucket: bucketName,
                    ContentType: "application/javascript; charset=utf-8",
                    Key: (originRoot + fileInfo.key)
                });

                log(`<bold:Uploaded :> https://cdn.ethers.io/lib/${ fileInfo.key }`);
            }

            // Flush the edge caches
            {
                const cloudfront = new AWS.CloudFront({
                    //apiVersion: '2006-03-01',
                    accessKeyId: awsAccessId,
                    secretAccessKey: awsSecretKey
                });

                const invalidationId = await invalidate(cloudfront, distributionId);
                log(`<bold:Invalidated Cache :> ${ invalidationId }`);
            }
        }
    }

})();
