import { dirnames, resolve } from "../path";
import { getPackage } from "../local";
import { loadJson, saveJson } from "../utils";

(async function() {
    const versions = dirnames.reduce((accum, dirname) => {
        const pkg = getPackage(dirname);
        accum[pkg.name] = pkg.version;
        return accum;
    }, <Record<string, string>>({ }));
    dirnames.forEach((dirname) => {
        // Skip ethers; it's versions are locked during update-versions
        if (dirname === "ethers") { return; }

        console.log(dirname);

        const path = resolve("packages", dirname, "package.json");
        const json = loadJson(path);
        for (const name in (json.dependencies || {})) {
            const version = json.dependencies[name];
            const target = (versions[name] ? ("^" + versions[name]): version);
            if (version !== target) {
                console.log("  ", name, version, "=>", target);
            }
            json.dependencies[name] = target;
        }
        saveJson(path, json, true);
    });
})();
