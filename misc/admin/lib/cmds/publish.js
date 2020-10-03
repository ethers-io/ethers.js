"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const fs_1 = __importDefault(require("fs"));
const changelog_1 = require("../changelog");
const config_1 = require("../config");
const depgraph_1 = require("../depgraph");
const git_1 = require("../git");
const github_1 = require("../github");
const local = __importStar(require("../local"));
const log_1 = require("../log");
const npm = __importStar(require("../npm"));
const path_1 = require("../path");
const utils_1 = require("../utils");
const USER_AGENT = "ethers-dist@0.0.1";
const TAG = "latest";
function putObject(s3, info) {
    return new Promise((resolve, reject) => {
        s3.putObject(info, function (error, data) {
            if (error) {
                reject(error);
            }
            else {
                resolve({
                    name: info.Key,
                    hash: data.ETag.replace(/"/g, '')
                });
            }
        });
    });
}
exports.putObject = putObject;
function invalidate(cloudfront, distributionId) {
    return new Promise((resolve, reject) => {
        cloudfront.createInvalidation({
            DistributionId: distributionId,
            InvalidationBatch: {
                CallerReference: `${USER_AGENT}-${parseInt(String((new Date()).getTime() / 1000))}`,
                Paths: {
                    Quantity: 1,
                    Items: [
                        "/\*"
                    ]
                }
            }
        }, function (error, data) {
            if (error) {
                console.log(error);
                return;
            }
            resolve(data.Invalidation.Id);
        });
    });
}
exports.invalidate = invalidate;
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const dirnames = depgraph_1.getOrdered();
        // @TODO: Fail if there are any untracked files or unchecked in files
        const publish = {};
        const progressUpdate = log_1.getProgressBar(log_1.colorify.bold("Finding updated packages..."));
        for (let i = 0; i < dirnames.length; i++) {
            progressUpdate(i / dirnames.length);
            let dirname = dirnames[i];
            let info = local.getPackage(dirname);
            let npmInfo = yield npm.getPackage(dirname);
            // No change in version, no need to publish
            if (info.version === npmInfo.version) {
                continue;
            }
            // Get the latest commit this package was modified at
            const path = path_1.resolve("packages", dirname);
            const gitHead = yield git_1.getGitTag(path);
            if (gitHead == null) {
                throw new Error("hmmm...");
            }
            publish[dirname] = {
                name: info.name,
                gitHead: gitHead,
                oldVersion: (npmInfo ? npmInfo.version : "NEW"),
                newVersion: info.version
            };
        }
        progressUpdate(1);
        console.log(log_1.colorify.bold(`Found ${Object.keys(publish).length} updated pacakges...`));
        Object.keys(publish).forEach((dirname) => {
            const info = publish[dirname];
            console.log(`  ${log_1.colorify.blue(info.name)} ${utils_1.repeat(" ", 50 - info.name.length - info.oldVersion.length)} ${info.oldVersion} ${log_1.colorify.bold("=>")} ${log_1.colorify.green(info.newVersion)}`);
        });
        const publishNames = Object.keys(publish);
        publishNames.sort((a, b) => (dirnames.indexOf(a) - dirnames.indexOf(b)));
        // Load the token from the encrypted store
        const options = {
            access: "public",
            npmVersion: USER_AGENT,
            tag: TAG
        };
        try {
            const token = (yield config_1.config.get("npm-token")).trim().split("=");
            options[token[0]] = token[1];
        }
        catch (error) {
            switch (error.message) {
                case "wrong password":
                    console.log(log_1.colorify.bold("Wrong password"));
                    break;
                case "cancelled":
                    break;
                default:
                    console.log(error);
            }
            console.log(log_1.colorify.red("Aborting."));
            return;
        }
        console.log(log_1.colorify.bold("Publishing:"));
        for (let i = 0; i < publishNames.length; i++) {
            const dirname = publishNames[i];
            const path = path_1.resolve("packages", dirname);
            const pathJson = path_1.resolve("packages", dirname, "package.json");
            const { gitHead, name, newVersion } = publish[dirname];
            console.log(`  ${log_1.colorify.blue(name)} @ ${log_1.colorify.green(newVersion)}`);
            local.updateJson(pathJson, { gitHead: gitHead }, true);
            const info = utils_1.loadJson(pathJson);
            yield npm.publish(path, info, options);
            local.updateJson(pathJson, { gitHead: undefined }, true);
        }
        if (publishNames.indexOf("ethers") >= 0) {
            const change = changelog_1.getLatestChange();
            const awsAccessId = yield config_1.config.get("aws-upload-scripts-accesskey");
            const awsSecretKey = yield config_1.config.get("aws-upload-scripts-secretkey");
            // Publish tagged release on GitHub
            {
                // The password above already succeeded
                const username = yield config_1.config.get("github-user");
                const password = yield config_1.config.get("github-release");
                const gitCommit = yield git_1.getGitTag(path_1.resolve("CHANGELOG.md"));
                // Publish the release
                const beta = false;
                const link = yield github_1.createRelease(username, password, change.version, change.title, change.content, beta, gitCommit);
                console.log(`${log_1.colorify.bold("Published release:")} ${link}`);
            }
            // Upload libs to the CDN (as ethers-v5.0 and ethers-5.0.x)
            {
                const bucketName = yield config_1.config.get("aws-upload-scripts-bucket");
                const originRoot = yield config_1.config.get("aws-upload-scripts-root");
                const s3 = new aws_sdk_1.default.S3({
                    apiVersion: '2006-03-01',
                    accessKeyId: awsAccessId,
                    secretAccessKey: awsSecretKey
                });
                // Upload the libs to ethers-v5.0 and ethers-5.0.x
                const fileInfos = [
                    { filename: "packages/ethers/dist/ethers.esm.min.js", key: `ethers-${change.version.substring(1)}.esm.min.js` },
                    { filename: "packages/ethers/dist/ethers.umd.min.js", key: `ethers-${change.version.substring(1)}.umd.min.js` },
                    { filename: "packages/ethers/dist/ethers.esm.min.js", key: "ethers-5.0.esm.min.js" },
                    { filename: "packages/ethers/dist/ethers.umd.min.js", key: "ethers-5.0.umd.min.js" },
                ];
                for (let i = 0; i < fileInfos.length; i++) {
                    const { filename, key } = fileInfos[i];
                    const status = yield putObject(s3, {
                        ACL: "public-read",
                        Body: fs_1.default.readFileSync(path_1.resolve(filename)),
                        Bucket: bucketName,
                        ContentType: "application/javascript; charset=utf-8",
                        Key: (originRoot + key)
                    });
                    console.log(status);
                    console.log(`${log_1.colorify.bold("Uploaded:")} https://cdn.ethers.io/lib/${key}`);
                }
            }
            // Flush the edge caches
            {
                const distributionId = yield config_1.config.get("aws-upload-scripts-distribution-id");
                const cloudfront = new aws_sdk_1.default.CloudFront({
                    //apiVersion: '2006-03-01',
                    accessKeyId: awsAccessId,
                    secretAccessKey: awsSecretKey
                });
                const invalidationId = yield invalidate(cloudfront, distributionId);
                console.log(`${log_1.colorify.bold("Invalidating Edge Cache:")} ${invalidationId}`);
            }
        }
    });
})();
