"use strict";

// Expected this to be run after
//   - npm run clean
//   - npm run bootstrap
//   - npm run build

const fs = require("fs");

const semver = require("semver");

const { runBuild, runDist } = require("../build");
const { ChangelogPath, generate } = require("../changelog");
const { getOrdered, loadPackage } = require("../depgraph");
const { getDiff, getStatus, getGitTag } = require("../git");
const { updatePackage } = require("../local");
const { getPackageVersion } = require("../npm");
const { resolve } = require("../utils");
const { colorify, log } = require("../log");

const { prompt } = require("../../packages/cli");

let dirnames = getOrdered();

// Only publish specific packages
if (process.argv.length > 2) {
    let filter = process.argv.slice(2);

    // Verify all named packages exist
    filter.forEach((dirname) => {
        try {
            loadPackage(dirname);
        } catch (error) {
            console.log("Package not found: " + dirname);
            process.exit(1);
        }
    });

    // Filter out pacakges we don't care about
    dirnames = dirnames.filter((dirname) => (filter.indexOf(dirname) >= 0));
}

(async function() {
    let progress = prompt.getProgressBar(colorify("Updating versions", "bold"));

    for (let i = 0; i < dirnames.length; i++) {
        progress(i / dirnames.length);

        let dirname = dirnames[i];
        let path = resolve("packages", dirname);

        // Get local package.json (update the tarballHash)
        let info = await updatePackage(dirname);

        // Get the remote package.json (or sub in a placeholder for new pacakges)
        let npmInfo = await getPackageVersion(info.name);
        if (!npmInfo) { npmInfo = { version: "NEW" }; }

        if (info.tarballHash === npmInfo.tarballHash) { continue; }

        // Bump the version if necessary
        if (info.version === npmInfo.version) {
            let newVersion = semver.inc(info.version, "patch");

            // Write out the _version.ts
            if (!info._ethers_nobuild) {
                let code = "export const version = " + JSON.stringify(dirname + "/" + newVersion) + ";\n";
                fs.writeFileSync(resolve(path, "src.ts/_version.ts"), code);
            }

            // Update the package.json (we do this after _version, so if we fail,
            // this remains old; which is what triggers the version bump)
            info = await updatePackage(dirname, { version: newVersion });
        }
    }
    progress(1);

    try {
        log("<bold:Building TypeScript source (es6)...>");
        await runBuild(true);
        log("<bold:Building TypeScript source (commonjs)...>");
        await runBuild(false);
        log("<bold:Building distribution files...>");
        let content = await runDist();
        console.log(content);
    } catch (error) {
        console.log(error);
        log("<red:Aborting.>");
        return;
    }

    // Update the tarball hash now that _version and package.json may have changed.
    progress = prompt.getProgressBar(colorify("Updating tarballHash", "bold"));
    for (let i = 0; i < dirnames.length; i++) {
        progress(i / dirnames.length);
        await updatePackage(dirnames[i]);
    }
    progress(1);

    // Show the changed files (compared to npm)
    for (let i = 0; i < dirnames.length; i++) {
        let dirname = dirnames[i];

        // Get local package.json
        let info = await loadPackage(dirname);
        let path = resolve("packages/", dirname);

        // Get the remote package.json (or sub in a placeholder for new pacakges)
        let npmInfo = await getPackageVersion(info.name);
        if (!npmInfo) { npmInfo = { version: "NEW" }; }

        // No change
        if (info.tarballHash === npmInfo.tarballHash) { continue; }

        let gitHead = await getGitTag(path);

        log(`<bold:Package>: ${info.name}`);
        log(`    <green:Tarball Changed:>   (bumping version)`);
        log(`        ${npmInfo.version}  =>  ${info.version}`)
        log(`    <blue:Changed:>`);
        let filenames = await getDiff(path, npmInfo.gitHead, true);
        filenames.forEach((filename) => {
            let short = filename.split("/").slice(1).join("/");
            if (short.indexOf("/src.ts/") >= 0 || short.indexOf("/dist/") >= 0) {
                log(`        <bold:${short}>`);
            } else {
                log(`        ${short}`);
            }
        });
        log("");
    }

    let existing = fs.readFileSync(ChangelogPath).toString();
    let changelog = await generate();
    if (existing !== changelog) {
        let changelogStatus = await getStatus(ChangelogPath);
        if (changelogStatus !== "unmodified") {
            log("<bold:WARNING:> There are local changes to the CHANGELOG (they will be discarded)");
            console.log(existing);
        }
        log("<bold:Updating CHANGELOG>...");
        fs.writeFileSync(ChangelogPath, changelog);
    }


})();
