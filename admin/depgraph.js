"use strict";

const fs = require("fs");

const { loadJson, resolve } = require("./utils");

const ROOT = resolve("packages");

const dirnames = fs.readdirSync(ROOT);

function loadPackage(dirname) {
    return loadJson(resolve("packages", dirname, "package.json"));
}

function getOrdered(skipNobuild) {
    let packages = { };
    let filenames = { };

    let addDeps = (name, depends) => {
        Object.keys(depends).forEach((dep) => {
            // Not a package we manage
            if (packages[dep] == null) { return; }
            deps[name][dep] = true;
        });
    }

    for (let i = 0; i < dirnames.length; i++) {
        let dirname = dirnames[i];
        let info = loadPackage(dirname);
        if (skipNobuild && info._ethers_nobuild) { continue; }
        packages[info.name] = info;
        filenames[info.name] = dirname;
    }

    // Maps names to list of dependencies; { [ name:string]: Array<name: string> }
    let deps = { };
    let depGraph = { };

    Object.keys(packages).forEach((name) => {
        let info = packages[name];
        deps[info.name] = { };
        addDeps(info.name, info.dependencies || { });
        addDeps(info.name, info.devDependencies || { });
        deps[info.name] = Object.keys(deps[info.name]);
        deps[info.name].sort();
    });

    let ordered = [ ];
    let remaining = Object.keys(deps);

    let isSatisfied = (name) => {
        for (let i = 0; i < deps[name].length; i++) {
            if (ordered.indexOf(deps[name][i]) === -1) { return false; }
        }
        return true;
    }

    while (remaining.length) {
        let bail = true;
        for (let i = 0; i < remaining.length; i++) {
            if (!isSatisfied(remaining[i])) { continue; }
            bail = false;
            ordered.push(remaining[i]);
            remaining.splice(i, 1);
            break;
        }

        if (bail) {
            throw new Error("Nothing processed; circular dependencies...");
        }
    }

    return ordered.map((name) => filenames[name]);
}

function sort(dirnames) {
    let ordered = getOrdered();
    dirnames.sort((a, b) => {
        let ai = ordered.indexOf(local.loadPackage(a).name);
        let bi = ordered.indexOf(local.loadPackage(b).name);
        if (ai === -1 || bi === -1) {
            throw new Error("unknown dirname - " + [a, b].join(", "));
        }
        return ai - bi;
    });
}

module.exports = {
    dirnames: dirnames,
    getOrdered: getOrdered,
    loadPackage: loadPackage,
    ROOT: ROOT,
    sort: sort
}
