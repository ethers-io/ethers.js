"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sort = exports.getOrdered = void 0;
const path_1 = require("./path");
const local_1 = require("./local");
class OrderedSet {
    constructor() {
        this._keys = [];
        this._values = {};
    }
    add(key) {
        this._values[key] = true;
        this._keys = null;
    }
    contains(key) {
        return !!this._values[key];
    }
    _sort() {
        if (this._keys != null) {
            return;
        }
        this._keys = Object.keys(this._values);
        this._keys.sort();
    }
    get length() {
        this._sort();
        return this._keys.length;
    }
    get(index) {
        this._sort();
        return this._keys[index];
    }
}
function getOrdered(skipNobuild) {
    const packages = {};
    const filenames = {};
    // Maps packages to names to list of dependencies; { [ name:string]: Array<name: string> }
    const deps = {};
    let addDeps = (name, depends) => {
        Object.keys(depends).forEach((dep) => {
            // Not a package we manage
            if (packages[dep] == null) {
                return;
            }
            deps[name].add(dep);
        });
    };
    for (let i = 0; i < path_1.dirnames.length; i++) {
        let dirname = path_1.dirnames[i];
        let info = (0, local_1.getPackage)(dirname);
        if (skipNobuild && info._ethers_nobuild) {
            continue;
        }
        packages[info.name] = info;
        filenames[info.name] = dirname;
    }
    Object.keys(packages).forEach((name) => {
        let info = packages[name];
        deps[info.name] = new OrderedSet();
        addDeps(info.name, info.dependencies || {});
        addDeps(info.name, info.devDependencies || {});
    });
    let ordered = [];
    let remaining = Object.keys(deps);
    let isSatisfied = (name) => {
        for (let i = 0; i < deps[name].length; i++) {
            if (ordered.indexOf(deps[name].get(i)) === -1) {
                return false;
            }
        }
        return true;
    };
    while (remaining.length) {
        let bail = true;
        for (let i = 0; i < remaining.length; i++) {
            if (!isSatisfied(remaining[i])) {
                continue;
            }
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
exports.getOrdered = getOrdered;
function sort(dirnames) {
    let ordered = getOrdered();
    dirnames.sort((a, b) => {
        let ai = ordered.indexOf((0, local_1.getPackage)(a).name);
        let bi = ordered.indexOf((0, local_1.getPackage)(b).name);
        if (ai === -1 || bi === -1) {
            throw new Error("unknown dirname - " + [a, b].join(", "));
        }
        return ai - bi;
    });
}
exports.sort = sort;
