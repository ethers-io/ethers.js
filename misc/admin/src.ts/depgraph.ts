
import { dirnames } from "./path";
import { getPackage, Package } from "./local";

class OrderedSet {
    _keys: Array<string>;
    _values: Record<string, boolean>

    constructor() {
        this._keys = [ ];
        this._values = { };
    }

    add(key: string): void {
        this._values[key] = true;
        this._keys = null;
    }

    contains(key: string): boolean {
        return !!this._values[key];
    }

    _sort(): void {
        if (this._keys != null) { return; }
        this._keys = Object.keys(this._values);
        this._keys.sort();
    }

    get length(): number {
        this._sort();
        return this._keys.length;
    }

    get(index: number): string {
        this._sort();
        return this._keys[index];

    }
}

export function getOrdered(skipNobuild?: boolean): Array<string> {
    const packages: Record<string, Package > = { };
    const filenames: Record<string, string> = { };

    // Maps packages to names to list of dependencies; { [ name:string]: Array<name: string> }
    const deps: Record<string, OrderedSet> = { };

    let addDeps = (name: string, depends: Record<string, string>) => {
        Object.keys(depends).forEach((dep) => {
            // Not a package we manage
            if (packages[dep] == null) { return; }
            deps[name].add(dep);
        });
    }

    for (let i = 0; i < dirnames.length; i++) {
        let dirname = dirnames[i];
        let info = getPackage(dirname);
        if (skipNobuild && info._ethers_nobuild) { continue; }
        packages[info.name] = info;
        filenames[info.name] = dirname;
    }

    Object.keys(packages).forEach((name) => {
        let info = packages[name];
        deps[info.name] = new OrderedSet();
        addDeps(info.name, info.dependencies || { });
        addDeps(info.name, info.devDependencies || { });
    });

    let ordered: Array<string> = [ ];
    let remaining = Object.keys(deps);

    let isSatisfied = (name: string) => {
        for (let i = 0; i < deps[name].length; i++) {
            if (ordered.indexOf(deps[name].get(i)) === -1) { return false; }
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

export function sort(dirnames: Array<string>): void {
    let ordered = getOrdered();
    dirnames.sort((a, b) => {
        let ai = ordered.indexOf(getPackage(a).name);
        let bi = ordered.indexOf(getPackage(b).name);
        if (ai === -1 || bi === -1) {
            throw new Error("unknown dirname - " + [a, b].join(", "));
        }
        return ai - bi;
    });
}

