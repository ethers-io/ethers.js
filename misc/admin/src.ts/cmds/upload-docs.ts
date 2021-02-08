import crypto from "crypto";
import fs from "fs";
import { join } from "path";
import AWS from 'aws-sdk';

import { config } from "../config";
import { resolve } from "../path";

type NextToken = string;
type NextTokenCallback = (error: Error, result: NextToken) => void;

function _getKeys(s3: AWS.S3, bucket: string, result: Record<string, string>, nextToken: NextToken, callback: NextTokenCallback) {
    const params = {
        Bucket: bucket,
        MaxKeys: 1000,
        ContinuationToken: nextToken,
    };

    s3.listObjectsV2(params, function(error, data) {
        if (error) {
            console.log(error);
            callback(error, undefined);
            return;
        }
        data.Contents.forEach(function(item) {
            result[item.Key] = item.ETag.replace(/"/g,'');
        });
        callback(null, data.IsTruncated ? data.NextContinuationToken: null);
    });
}

export function getKeys(s3: AWS.S3, bucket: string): Promise<Record<string, string>> {
    const result: Record<string, string> = { };
    return new Promise(function(resolve, reject) {
        function handleBlock(error: Error, nextToken: NextToken) {
            if (error) {
                reject(error);
            } else if (nextToken) {
                nextBlock(nextToken);
            } else {
                resolve(result);
            }
        }
        function nextBlock(nextToken: NextToken) {
            _getKeys(s3, bucket, result, nextToken, handleBlock);
        }
        nextBlock(undefined);
    });
}

function getMime(filename: string): string {
    const ext = filename.split('.').pop();
    switch (ext.toLowerCase()) {
        case 'css':      return 'text/css';
        case 'doctree':  return 'application/x-doctree';
        case 'eot':      return 'application/vnd.ms-fontobject';
        case 'gif':      return 'image/gif';
        case 'html':     return 'text/html';
        case 'ico':      return 'image/x-icon';
        case 'js':       return 'application/javascript';
        case 'jpg':      return 'image/jpeg';
        case 'jpeg':     return 'image/jpeg';
        case 'json':     return 'application/json';
        case 'md':       return 'text/markdown';
        case 'pickle':   return 'application/x-pickle';
        case 'png':      return 'image/png';
        case 'svg':      return 'image/svg+xml';
        case 'ttf':      return 'application/x-font-ttf';
        case 'txt':      return 'text/plain';
        case 'woff':     return 'application/font-woff';
    }
    console.log('NO MIME', filename);
    return undefined;
}

export function putObject(s3: AWS.S3, bucket: string, name: string, content: string | Buffer) {
    return new Promise(function(resolve, reject) {
        s3.putObject({
            ACL: 'public-read',
            Body: content,
            Bucket: bucket,
            ContentType: getMime(name),
            Key: name
        }, function(error, data) {
            if (error) {
                reject(error);
            } else {
                console.log("  Done.")
                resolve({
                    name: name,
                    hash: data.ETag.replace(/"/g, '')
                });
            }
        });
    });
}

function hash(filename: string): string {
    const hasher = crypto.createHash('md5');
    hasher.update(fs.readFileSync(filename));
    return hasher.digest().toString('hex');
}

function _getFiles(result: Record<string, string>, root: string): void {
    fs.readdirSync(root).forEach(function(filename) {

        // We don't need to upload junk
        if (filename === '.DS_Store') { return; }

        const fullFilename = join(root, filename)
        const stat = fs.statSync(fullFilename);
        if (stat.isDirectory()) {
            _getFiles(result, fullFilename);
        } else {
            result[fullFilename] = hash(fullFilename);
        }
    });
}

function getFiles(basedir: string): Record<string, string> {
    // Make sure we have a trailing slash
    if (!basedir.match(/\/$/)) { basedir += "/"; }

    // Fetch all the file hashes
    const hashes: Record<string, string> = { };
    _getFiles(hashes, basedir);

    return Object.keys(hashes).reduce((accum, key) => {
        accum[key.substring(basedir.length)] = hashes[key];
        return accum;
    }, <Record<string, string>>({ }));
}

(async function() {
    const bucket = "docs.ethers.io";

    const awsAccessId = await config.get("aws-upload-docs-accesskey");
    const awsSecretKey = await config.get("aws-upload-docs-secretkey");

    const s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        accessKeyId: awsAccessId,
        secretAccessKey: awsSecretKey
    });

    const added: Array<string> = [], removed: Array<string> = [], changed: Array<string> = [], upload: Array<string> = [];

    const basedir = resolve("docs");

    const local = await getFiles(basedir);
    const remote = await getKeys(s3, bucket);

    Object.keys(local).forEach((filename) => {
        if (!remote[filename]) {
            added.push(filename);
            upload.push(filename);
        } else if (remote[filename] != local[filename]) {
            changed.push(filename);
            upload.push(filename);
        }
    });

    Object.keys(remote).forEach((filename) => {
        if (!local[filename]) {
            removed.push(filename);
        } else if (!local[filename] && remote[filename] != local[filename]) {
            changed.push(filename);
            upload.push(filename);
        }
    });

    console.log('Added:    ', added.length);
    console.log('Removed:  ', removed.length);
    console.log('Changed:  ', changed.length);

    for (let i = 0; i < upload.length; i++) {
        const filename = upload[i];
        const content = fs.readFileSync(join(basedir, filename));
        console.log(`Uploading: ${ filename } (${ content.length } bytes)`);
        await putObject(s3, bucket, filename, content);
    }
})();
