"use strict";

const packlist = require("npm-packlist");
const tar = require("tar");

const keccak256 = (function() {
    try {
        return require("../packages/keccak256").keccak256;
    } catch (error) {
        console.log("Cannot load Keccak256 (maybe not built yet? Not really a problem for most things)");
        return null;
    }
})();

const { dirnames, loadPackage, ROOT } = require("./depgraph");
const { resolve, saveJson } = require("./utils");

function sorted(obj) {
    if (Array.isArray(obj)) { return obj.map(sorted); }
    if (obj == null || typeof(obj) !== "object") { return obj; }

    const keys = Object.keys(obj);
    keys.sort();

    const result = { };
    keys.forEach((key) => { result[key] = sorted(obj[key]); });
    return result;
}

function savePackage(dirname, info) {
    return saveJson(resolve(ROOT, dirname, "package.json"), sorted(info));
}

async function createTarball(dirname) {
    let base = resolve(ROOT, dirname);

    // From NPM publish, create the packed version
    let files = await packlist({ path: base });
    files = files.map((f) => ("./" + f));

    let options = {
        cwd: base,
        prefix: 'package/',
        portable: true,
        sync: true,
        // Provide a specific date in the 1980s for the benefit of zip,
        // which is confounded by files dated at the Unix epoch 0.
        mtime: new Date('1985-10-26T08:15:00.000Z'),
        gzip: true
    };

    // Take the hash of the package sans
    return tar.create(options, files).read();
}

async function updatePackage(dirname, values) {
    let info = loadPackage(dirname);

    if (values) {
        for (let key in values) {
            info[key] = values[key];
        }
    }
    /*
    ["dependencies", "devDependencies"].forEach((key) => {
        let deps = info[key] || [];
        for (let name in deps) {
            if (name.substring(0, "@ethersproject".length) === "@ethersproject" || name === "ethers") {
                deps[name] = ">5.0.0-beta.0";
            }
        }
    });
    */

    //if (dirname !== "ethers") {
    //    delete info.publishConfig.tag;
    //}

    // Create a normalized version sans tarballHash to compute the tarballHash
    delete info.tarballHash;
    savePackage(dirname, info);

    // Compute the tarballHash
    let tarball = await createTarball(dirname);
    info.tarballHash = keccak256(tarball);

    // Save the updated package.json to disk
    savePackage(dirname, info);

    return info;
}

module.exports = {
    ROOT: ROOT,
    createTarball: createTarball,
    dirnames: dirnames,
    getVersion: function(dirname) { return ((loadPackage(dirname) || {}).version || null); },
    loadPackage: loadPackage,
    savePackage: savePackage,
    updatePackage: updatePackage,
}
