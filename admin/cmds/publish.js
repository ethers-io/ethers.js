"use strict";

const config = require("../config");

const { latestChange } = require("../changelog");
const { getOrdered, loadPackage } = require("../depgraph");
const { createRelease } = require("../github");
const { getPackageVersion, publish } = require("../npm");
const { log } = require("../log");

const USER_AGENT = "ethers-dist@0.0.0";
const TAG = "next";


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
    let token = null;

    let includeEthers = false;

    // @TODO: Fail if there are any untracked files or unchecked in files

    // Load the token from the encrypted store
    try {
        token = await config.get("npm-token");
    } catch (error) {
        switch (error.message) {
            case "wrong password":
                log("<bold:Wrong password>");
                break;
            case "cancelled":
                break;
            default:
                console.log(error);
        }

        log("<red:Aborting.>");

        return;
    }

    token = token.trim().split("=");

    let options = {
        npmVersion: USER_AGENT,
        tag: TAG
    };

    // Set the authentication token
    options[token[0]] = token[1];

    for (let i = 0; i < dirnames.length; i++) {
        let dirname = dirnames[i];

        if (dirname === "ethers") {
            options.tag = "next";
            includeEthers = true;
        } else {
            options.tag = "latest";
        }

        let info = loadPackage(dirname);
        let npmInfo = await getPackageVersion(info.name);
        if (!npmInfo) { npmInfo = { version: "NEW" }; }

        if (info.tarballHash === npmInfo.tarballHash) { continue; }

        log(`<bold:Publishing:> ${info.name}...`);
        log(`  <blue:Version:> ${npmInfo.version} <bold:=\\>> ${info.version}`);

        let success = await publish(dirname, options);
        if (!success) {
            log("  <red:FAILED! Aborting.>");
            return;
        }
        log("  <green:Done.>");
    }

    // Publish the GitHub release (currently beta)
    const beta = true;
    if (includeEthers) {

        // The password above already succeeded
        const username = await config.get("github-user");
        const password = await config.get("github-release");

        // Get the latest change from the changelog
        const change = latestChange();

        // Publish the release
        const link = await createRelease(username, password, change.version, change.title, change.content, beta);
        log(`<bold:Published Release:> ${ link }`);
    }

})();
