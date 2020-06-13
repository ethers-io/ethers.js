"use strict";

const resolve = require("path").resolve;

const npmpub = require("libnpmpublish");
const semver = require("semver");

const local = require("./local");

const keccak256 = require("../packages/keccak256").keccak256;
const fetchJson = require("../packages/web").fetchJson;
const { prompt } = require("../packages/cli");

const colorify = require("./log").colorify;
const git = require("./git");


let cache = { };

async function getPackage(name) {
    if (cache[name]) { return cache[name]; }

    return fetchJson("http:/" + "/registry.npmjs.org/" + name).then((result) => {
        cache[name] = result;
        return result;
    }, (error) => {
        if (error.status === 404) {
            return null;
        }
        throw error;
    });
}

async function getVersion(name) {
    return getPackage(name).then((result) => {
        if (!result) { return null; }
        let versions = Object.keys(result.versions);
        versions.sort(semver.compare)
        return versions.pop();
    });
}

async function getPackageVersion(name, version) {
    let info = await getPackage(name)
    if (!info) { return null; }

    if (version == null) {
        let versions = Object.keys(info.versions);
        versions.sort(semver.compare);
        version = versions.pop();
    }

    return info.versions[version] || null;
}

async function getTarballHash(name, version) {
    let info = await getPackageVersion(name, version);
    return (info || {}).tarballHash;
}

async function _publish(info, tarball, options) {
    try {
        let result = await npmpub.publish(info, tarball, options);
        return result;
    } catch (error) {

        // We need an OTP
        if (error.code === "EOTP") {
            try {
                let otp = await prompt.getMessage(colorify("Enter OTP: ", "bold"));
                options.otp = otp.replace(" ", "");
            } catch (error) {

                // CTRL-C
                if (error.message === "cancelled") {
                    return false;
                }

                // Something unexpected...
                throw error;
            }

            // Retry with the new OTP
            return _publish(info, tarball, options);
        }
        throw error;
    }
}

async function publish(dirname, options) {
    let info = local.loadPackage(dirname);
    info.gitHead = await git.getGitTag(resolve(__dirname, "../packages/", dirname));
    if (info.gitHead == null) { throw new Error("no git tag found - " + dirname); }
    let tarball = await local.createTarball(dirname);
    return _publish(info, tarball, options);
}

module.exports = {
    getPackage: getPackage,
    getPackageVersion: getPackageVersion,
    getTarballHash: getTarballHash,
    getVersion: getVersion,
    publish: publish,
};
