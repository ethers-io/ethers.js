"use strict";

const fs = require("fs");
const resolve = require("path").resolve;

const diff = require("diff");
const semver = require("semver");

const { prompt } = require("../packages/cli");

const build = require("./build");
const changelog = require("./changelog");
const depgraph = require("./depgraph");
const { colorify, colorifyStatus, log } = require("./log");
const config = require("./config")
const git = require("./git");
const local = require("./local");
const npm = require("./npm");
const utils = require("./utils");

/*
async function runChanged(dirnames, callback) {
            try {
                await callback(dirname, info, npmInfo);
            } catch (error) {
                console.log(error);
                console.log(colorify("Aborting! " + error.message));
                return;
            }
        }
    }
}
*/
/*
        if (diff) {
        } else {
*/

async function runDiff(dirnames) {
    // Default to all packages
    if (dirnames == null || dirnames.length === 0) { dirnames = local.dirnames; }

    for (let i = 0; i < dirnames.length; i++) {
        let dirname = dirnames[i];

        // Get local (update the tarballHash) and remote package.json
        let info = await local.loadPackage(dirname);
        let npmInfo = await npm.getPackageVersion(info.name);
        if (!npmInfo) { npmInfo = { gitHead: "HEAD", version: "NEW" }; }

        let delta = await git.getDiff(resolve(__dirname, "../packages", dirname), npmInfo.gitHead);

        if (delta.length === 0) { continue; }

        // Bump the version if necessary
        if (info.version === npmInfo.version) {
            info.version = semver.inc(info.version, "patch");
        }

        console.log(colorify("<bold:Package>: ") + info.name);
        console.log(colorify("    <green:Git Head Changed:>   (run update to bump version)"));
        console.log("        " + npmInfo.gitHead)
        console.log("        " + npmInfo.version + colorify("  =>  ", "bold") + info.version)

        console.log(colorify("    Diff", "bold"));
        delta.forEach((line) => {
            let color = "blue";
            switch (line.substring(0, 1)) {
                case '+':
                    color = "green";
                    break;
                case '-':
                    color = "red";
                    break;
                case ' ':
                    color = "normal";
                    break;
            }
            console.log("        " + colorify(line, color));
        });

        console.log("");
    }

    console.log("");
}

async function updateChangelog() {
    let filename = resolve(local.ROOT, "../CHANGELOG.md");

    let lastVersion = await git.getLatestTag();
    let newVersion = "v" + local.getVersion("ethers");

    let current = fs.readFileSync(filename).toString();
    let log = await changelog.generate();
    if (log === current) { return; }

    let changes = diff.createTwoFilesPatch("CHANGELOG-old.md", "CHANGELOG.md", current, log, lastVersion, newVersion);
    console.log(changes);

    try {
        let response = await prompt.getChoice(colorify("Accept changes?", "bold"), "yn", "n");
        if (response === "n") { throw new Error("Not changing."); }
    } catch (error) {
        console.log("Abort: " + error.message);
        return;
    }

    fs.writeFileSync(filename, log);
}

// Updates the dependency-graph (tsconfig.project.json) so the build order is correct
async function runUpdateDepgraph() {
    log(`<bold:Updating dependency-graph build order (tsconfig.project.json)...>`);
    let ordered = depgraph.getOrdered();

    let path = resolve(local.ROOT, "../tsconfig.project.json")

    let projectConfig = local.loadJson(path);
    projectConfig.references = ordered.map((name) => ({ path: ("./packages/" + name) }));
    local.saveJson(path, projectConfig);
}

async function runUpdate(dirnames) {

    // Check for untracked files...
    let untracked = [ ];
    if (dirnames == null || dirnames.length === 0) {
        dirnames = local.dirnames;
        let filenames = await git.getUntracked(resolve(__dirname, ".."));
        for (let i = 0; i < filenames.length; i++) {
            untracked.push(filenames[i]);
        }
    } else {
        for (let i = 0; i < dirnames.length; i++) {
            let filenames = await git.getUntracked(resolve(local.ROOT, dirnames[i]));
            for (let j = 0; j < filenames.length; j++) {
                untracked.push(filenames[j]);
            }
        }
    }

    // Untracked files! Abort.
    if (untracked.length) {
        log("<bold:Untracked Files:>");
        untracked.forEach((filename) => {
            console.log("  " + filename);
        });
        log("<red:Aborting.>");
        return;
    }

    log(`<bold:Run TypeScript build...>`);
    await build.runBuild()

    log("");

    // @TODO: Root

    // Update all the package.json and _version.ts
    let progress = prompt.getProgressBar(colorify("Updating versions", "bold"));
    for (let i = 0; i < dirnames.length; i++) {
        progress(i / dirnames.length);

        let dirname = dirnames[i];
        let path = resolve(__dirname, "../packages/", dirname);

        // Get local package.json (update the tarballHash)
        let info = await local.updatePackage(dirname);

        // Get the remote package.json (or sub in a placeholder for new pacakges)
        let npmInfo = await npm.getPackageVersion(info.name);
        if (!npmInfo) { npmInfo = { version: "NEW" }; }

        if (info.tarballHash === npmInfo.tarballHash) { continue; }

        // Bump the version if necessary
        if (info.version === npmInfo.version) {
            let newVersion = semver.inc(info.version, "patch");

            // Write out the _version.ts
            if (!info._ethers_skipPrepare) {
                let code = "export const version = " + JSON.stringify(newVersion) + ";\n";
                fs.writeFileSync(resolve(path, "src.ts/_version.ts"), code);
            }

            // Update the package.json (we do this after _version, so if we fail,
            // this remains old; which is what triggers the version bump)
            info = await local.updatePackage(dirname, { version: newVersion });
        }
    }
    progress(1);

    // Build the TypeScript sources
    log("<bold:Runing TypeScript build...>");
    try {
        await build.runTsc();
    } catch (error) {
        console.log(error);
        log("<red:Aborting.>");
        return;
    }

    // Run the dist
    // @TODO:

    // Update the tarball hash now that _version and package.json may have changed.
    progress = prompt.getProgressBar(colorify("Updating tarballHash", "bold"));
    for (let i = 0; i < dirnames.length; i++) {
        progress(i / dirnames.length);
        await local.updatePackage(dirnames[i]);
    }
    progress(1);

    // Show the changed files (compared to npm)
    for (let i = 0; i < dirnames.length; i++) {
        let dirname = dirnames[i];

        // Get local package.json
        let info = await local.loadPackage(dirname);
        let path = resolve(__dirname, "../packages/", dirname);

        // Get the remote package.json (or sub in a placeholder for new pacakges)
        let npmInfo = await npm.getPackageVersion(info.name);
        if (!npmInfo) { npmInfo = { version: "NEW" }; }

        // No change
        if (info.tarballHash === npmInfo.tarballHash) { continue; }

        let gitHead = await git.getGitTag(path);

        log(`<bold:Package>: ${info.name}`);
        log(`    <green:Tarball Changed:>   (bumping version)`);
        log(`        ${npmInfo.version}  =>  ${info.version}`)
        log(`    <blue:Changed:>`);
        let filenames = await git.getDiff(resolve(__dirname, "../packages", dirname), npmInfo.gitHead, true);
        filenames.forEach((filename) => {
            let short = filename.split("/").slice(1).join("/");
            if (short.indexOf("/src.ts/") >= 0) {
                log(`        <bold:${short}>`);
            } else {
                log(`        ${short}`);
            }
        });
        log("");
    }

    // @TODO: Changelog
    await updateChangelog();
}

async function runAdd(type, names) {
    let latest = await git.getLatestTag();
    console.log("");
    console.log(colorify("<bold:Latest Published>: ") + latest);
    console.log("");

    let changes = await git.getChanges("HEAD");

    if (!names || names.length === 0) {
        names = Object.keys(changes);
    }

    let filenames = [ ];
    for (let i = 0; i < names.length; i++) {
        let name = names[i];
        let change = changes[name] || changes[(packages[name] || {}).name];
        if (!change) { return; }
        change[type].forEach((filename) => {
            filenames.push(filename);
        });
    }

    if (filenames.length === 0) {
        console.log(colorify("<bold:Nothing to add.>"));
        console.log("");
        return;
    }

    for (let i = 0; i < filenames.length; i++) {
        let filename = filenames[i];
        let status = await git.getStatus(filename);
        console.log("    " + colorifyStatus(status) + ": " + utils.repeat(" ", 10 - status.length) + filename);
    }

    console.log("");

    try {
        let response = await prompt.getChoice(colorify("Add these files?", "bold"), "yn", "n");
        if (response === "n") { throw new Error("Not adding."); }
    } catch (error) {
        console.log("Abort: " + error.message);
        return;
    }

    let params = filenames.map((f) => f); //resolve(ROOT, f));
    params.unshift("--");
    params.unshift("add");

    console.log("git " + params.join(" "));

    try {
        await git.run(params);
    } catch (error) {
        console.log("Error: (status: " + error.code + ")");
        console.log("  " + error.stderr);
        return;
    }

    console.log("Added.");
}

function runDist() {
    // Run npm dist
    // Generate changelog
    // run status to update all the package
    // add dist files?
}

async function runPublish(dirnames) {

    // @TODO: Make sure there are no staged files

    // @TODO: Make sure the repo has been pushed

    // @TODO: Run the publish in the correct order

    // Get the authentication token from our encrypted store
    let token = await config.get("token");
    token = token.trim().split("=");

    let options = {
        npmVersion: "ethers-dist@0.0.0",
        tag: "next"
    };

    // Set the authentication token
    options[token[0]] = token[1];

    if (dirnames == null || dirnames.length === 0) { dirnames = local.dirnames; }
    depgraph.sort(dirnames);

    await runChanged(dirnames, async (dirname, info, npmInfo) => {
        console.log(colorify("<bold:Publishing:> ") + info.name + "...")
        console.log(colorify("  Version: ", "blue") + npmInfo.version + colorify("  =>  ", "bold") + info.version);

        let success = await npm.publish(dirname, options);
        if (!success) {
            console.log(colorify("  <red:FAILED! Aborting.>"));
            throw new Error("");
        }
        console.log(colorify("  <green:Done.>"));
    });
}

async function runTest() {
    let r = await git([ "tag", "--porcelain", "-a", "-m", "Title of Release\n\nHello\n-----\n\nTesting 4 **bold** #1\nHello World", "test6", "HEAD" ]);
    console.log(r);
    try {
    r = await git([ "push", "--tags" ])
    } catch(e) { console.log(e); }
    console.log(r);
}

(function() {
    let args = process.argv.slice(2);
    switch (args[0]) {

        // Compare published to current stage
        case "diff":
            return runDiff(args.slice(1));

        // Add unchecked-in source files
        case "add-source":
            return runAdd("src", args.slice(1));

        // Update all package.json. the changelog and dist files
        case "update":
            return runUpdate(args.slice(1));

        // Update dependency graph (./tsconfig-project.json)
        case "update-depgraph":
            return runUpdateDepgraph();

        // Add unchecked-in dist files
        case "add-dist":
            return runAdd("dist", args.slice(1));


        // Add unchecked-in source files
        case "changelog":
            return updateChangelog();

        // Add unchecked-in source files
        case "publish":
            return runPublish(args.slice(1));

        case "test":
            return runTest();
    }
})();
