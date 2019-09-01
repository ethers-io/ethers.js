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
                if (versions[name] == null) { return; }
                const value = ">=" + versions[name];
                if (value !== deps[name])
                if (!deps[name]) { return; }
                if (!shown) {
                    log(`<bold:Locking ${ info.name }:>`);
                    shown = true;
                }
                log(`    <green:${ name }>: ${ deps[name] } => <bold:${ value.substring(2) }>`);
                deps[name] = value;
            });
        });
        savePackage(dirname, info);
    });

})();
