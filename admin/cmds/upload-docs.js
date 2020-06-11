"use strict";

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const config = require("../config");


const Bucket = "docs.ethers.io";


function _getKeys(s3, result, nextToken, callback) {
    const params = {
        Bucket: Bucket,
        MaxKeys: 1000,
        ContinuationToken: nextToken,
    };
    s3.listObjectsV2(params, function(error, data) {
        if (error) {
            console.log(error);
            callback(error);
            return;
        }
        data.Contents.forEach(function(item) {
            result[item.Key] = item.ETag.replace(/"/g,'');
        });
        callback(null, data.IsTruncated ? data.NextContinuationToken: null);
    });
}

function getKeys(s3) {
    const result = {};
    return new Promise(function(resolve, reject) {
        function handleBlock(error, nextToken) {
            if (error) {
                reject(error);
            } else if (nextToken) {
                nextBlock(nextToken);
            } else {
                resolve(result);
            }
        }
        function nextBlock(nextToken) {
            _getKeys(s3, result, nextToken, handleBlock);
        }
        nextBlock(undefined);
    });
}

function getMime(filename) {
    const comps = filename.split('.');
    const ext = comps[comps.length - 1];
    switch (ext.toLowerCase()) {
        case 'css':      return 'text/css';
        case 'doctree':  return 'application/x-doctree';
        case 'eot':      return 'application/vnd.ms-fontobject';
        case 'gif':      return 'image/gif';
        case 'html':     return 'text/html';
        case 'js':       return 'application/javascript';
        case 'jpg':      return 'image/jpeg';
        case 'jpeg':     return 'image/jpeg';
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

function putObject(s3, name, content) {
    return new Promise(function(resolve, reject) {
        s3.putObject({
            ACL: 'public-read',
            Body: content,
            Bucket: Bucket,
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

function hash(filename) {
    const hasher = crypto.createHash('md5');
    hasher.update(fs.readFileSync(filename));
    return hasher.digest().toString('hex');
}

function _getFiles(result, root) {
    fs.readdirSync(root).forEach(function(filename) {

        // We don't need to upload junk
        if (filename === '.DS_Store') { return; }

        const fullFilename = path.join(root, filename)
        const stat = fs.statSync(fullFilename);
        if (stat.isDirectory()) {
            _getFiles(result, fullFilename);
        } else {
            result[fullFilename] = hash(fullFilename);
        }
    });
}

function getFiles(basedir) {
    // Make sure we have a trailing slash
    if (!basedir.match(/\/$/)) { basedir += "/"; }

    // Fetch all the file hashes
    const hashes = { };
    _getFiles(hashes, basedir);

    return Object.keys(hashes).reduce((accum, key) => {
        accum[key.substring(basedir.length)] = hashes[key];
        return accum;
    }, { });
}

(async function() {
    const awsAccessId = await config.get("aws-upload-docs-accesskey");
    const awsSecretKey = await config.get("aws-upload-docs-secretkey");

    const s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        accessKeyId: awsAccessId,
        secretAccessKey: awsSecretKey
    });

    const added = [], removed = [], changed = [], upload = [];

    const basedir = path.resolve(__dirname, "../../docs");

    const local = await getFiles(basedir);
    const remote = await getKeys(s3);

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
        const content = fs.readFileSync(path.resolve(basedir, filename));
        console.log(`Uploading: ${ filename } (${ content.length } bytes)`);
        await putObject(s3, filename, content);
    }
})();
