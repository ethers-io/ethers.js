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
Object.defineProperty(exports, "__esModule", { value: true });
exports.putObject = exports.getKeys = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const config_1 = require("../config");
const path_2 = require("../path");
function _getKeys(s3, bucket, result, nextToken, callback) {
    const params = {
        Bucket: bucket,
        MaxKeys: 1000,
        ContinuationToken: nextToken,
    };
    s3.listObjectsV2(params, function (error, data) {
        if (error) {
            console.log(error);
            callback(error, undefined);
            return;
        }
        data.Contents.forEach(function (item) {
            result[item.Key] = item.ETag.replace(/"/g, '');
        });
        callback(null, data.IsTruncated ? data.NextContinuationToken : null);
    });
}
function getKeys(s3, bucket) {
    const result = {};
    return new Promise(function (resolve, reject) {
        function handleBlock(error, nextToken) {
            if (error) {
                reject(error);
            }
            else if (nextToken) {
                nextBlock(nextToken);
            }
            else {
                resolve(result);
            }
        }
        function nextBlock(nextToken) {
            _getKeys(s3, bucket, result, nextToken, handleBlock);
        }
        nextBlock(undefined);
    });
}
exports.getKeys = getKeys;
function getMime(filename) {
    const ext = filename.split('.').pop();
    switch (ext.toLowerCase()) {
        case 'css': return 'text/css';
        case 'doctree': return 'application/x-doctree';
        case 'eot': return 'application/vnd.ms-fontobject';
        case 'gif': return 'image/gif';
        case 'html': return 'text/html';
        case 'ico': return 'image/x-icon';
        case 'js': return 'application/javascript';
        case 'jpg': return 'image/jpeg';
        case 'jpeg': return 'image/jpeg';
        case 'json': return 'application/json';
        case 'md': return 'text/markdown';
        case 'pickle': return 'application/x-pickle';
        case 'png': return 'image/png';
        case 'svg': return 'image/svg+xml';
        case 'ttf': return 'application/x-font-ttf';
        case 'txt': return 'text/plain';
        case 'woff': return 'application/font-woff';
    }
    console.log('NO MIME', filename);
    return undefined;
}
function putObject(s3, bucket, name, content) {
    return new Promise(function (resolve, reject) {
        s3.putObject({
            ACL: 'public-read',
            Body: content,
            Bucket: bucket,
            ContentType: getMime(name),
            Key: name
        }, function (error, data) {
            if (error) {
                reject(error);
            }
            else {
                console.log("  Done.");
                resolve({
                    name: name,
                    hash: data.ETag.replace(/"/g, '')
                });
            }
        });
    });
}
exports.putObject = putObject;
function hash(filename) {
    const hasher = crypto_1.default.createHash('md5');
    hasher.update(fs_1.default.readFileSync(filename));
    return hasher.digest().toString('hex');
}
function _getFiles(result, root) {
    fs_1.default.readdirSync(root).forEach(function (filename) {
        // We don't need to upload junk
        if (filename === '.DS_Store') {
            return;
        }
        const fullFilename = (0, path_1.join)(root, filename);
        const stat = fs_1.default.statSync(fullFilename);
        if (stat.isDirectory()) {
            _getFiles(result, fullFilename);
        }
        else {
            result[fullFilename] = hash(fullFilename);
        }
    });
}
function getFiles(basedir) {
    // Make sure we have a trailing slash
    if (!basedir.match(/\/$/)) {
        basedir += "/";
    }
    // Fetch all the file hashes
    const hashes = {};
    _getFiles(hashes, basedir);
    return Object.keys(hashes).reduce((accum, key) => {
        accum[key.substring(basedir.length)] = hashes[key];
        return accum;
    }, ({}));
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const bucket = "docs.ethers.io";
        const awsAccessId = yield config_1.config.get("aws-upload-docs-accesskey");
        const awsSecretKey = yield config_1.config.get("aws-upload-docs-secretkey");
        const s3 = new aws_sdk_1.default.S3({
            apiVersion: '2006-03-01',
            accessKeyId: awsAccessId,
            secretAccessKey: awsSecretKey
        });
        const added = [], removed = [], changed = [], upload = [];
        const basedir = (0, path_2.resolve)("docs");
        const local = yield getFiles(basedir);
        const remote = yield getKeys(s3, bucket);
        Object.keys(local).forEach((filename) => {
            if (!remote[filename]) {
                added.push(filename);
                upload.push(filename);
            }
            else if (remote[filename] != local[filename]) {
                changed.push(filename);
                upload.push(filename);
            }
        });
        Object.keys(remote).forEach((filename) => {
            if (!local[filename]) {
                removed.push(filename);
            }
            else if (!local[filename] && remote[filename] != local[filename]) {
                changed.push(filename);
                upload.push(filename);
            }
        });
        console.log('Added:    ', added.length);
        console.log('Removed:  ', removed.length);
        console.log('Changed:  ', changed.length);
        for (let i = 0; i < upload.length; i++) {
            const filename = upload[i];
            const content = fs_1.default.readFileSync((0, path_1.join)(basedir, filename));
            console.log(`Uploading: ${filename} (${content.length} bytes)`);
            yield putObject(s3, bucket, filename, content);
        }
    });
})();
