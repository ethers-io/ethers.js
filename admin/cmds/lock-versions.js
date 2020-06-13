"use strict";

const { getOrdered, loadPackage } = require("../depgraph");
const { savePackage } = require("../local");
const { log } = require("../log");

(async function() {
    let versions = { };

    const dirnames = getOrdered();

    dirnames.forEach((dirname) => {
        let info = loadPackage(dirname);
        if (info.name.split("/")[0] === "@ethersproject" || info.name === "ethers") {
            versions[info.name] = info.version;
        }
    });

    dirnames.forEach((dirname) => {
        const info = loadPackage(dirname);
        let shown = false;
        ["dependencies", "devDependencies"].forEach((key) => {
            const deps = info[key];
            if (!deps) { return; }
            Object.keys(deps).forEach((name) => {
                // Not a package in this monorepoa
                const version = versions[name];
                if (version == null) { return; }

                const value = ((version.indexOf("beta") !== -1) ? ">=": "^") + version;

                // No change
                if (value === deps[name]) { return; }

                // Show a header for the first change
                if (!shown) {
                    log(`<bold:Locking ${ info.name }:>`);
                    shown = true;
                }

                // Show the locked version
                log(`    <green:${ name }>: ${ deps[name] } => <bold:${ value.replace(">", "&gt;") }>`);
                deps[name] = value;
            });
        });
        savePackage(dirname, info);
    });

})();
