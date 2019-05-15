"use strict";

const resolve = require("path").resolve;
const spawn = require("child_process").spawn;

const semver = require("semver");

const { run } = require("./build");
const { loadPackage } = require("./local");

function git(args) {
    return run("git", args);
}

function getStatus(filename) {
    return git([ "status", "-s", resolve(__dirname, "..", filename) ]).then((result) => {
        result = result.trim();
        if (result === "") { return "unmodified"; }
        switch (result.substring(0, 2)) {
            case 'M ': return "modified";
            case 'A ': return "added";
            case 'D ': return "deleted";
            case 'R ': return "renamed";
            case 'C ': return "copied";
            case 'U ': return "updated";
            case '??': return "untracked";
        }
        console.log(result);
        return "unknown";
    });
}

async function getChanges(latest) {
    let diff = await git(["diff", "--name-only", latest ]);

    // Map dirname => { dist: [ ], src: [ ] }
    let changes = { "_": { filename: "_", dist: [], src: [] } };

    diff.split("\n").forEach((line) => {
        // e.g. packages/constants/index.d.ts
        let comps = line.trim().split("/");

        // Track non-packages as dist
        if (comps.length < 2 || comps[0] !== "packages") {
            let filename = comps.join("/").trim();
            if (filename === "") { return; }
            changes._.dist.push(filename);
            return;
        }

        let name = loadPackage(comps[1]).name;

        let change = changes[name];
        if (!change) {
            change = { filename: comps[1], dist: [ ], src: [ ] }
            changes[name] = change;
        }

        // Split changes into source changes (src.ts/) or dist changes (output of TypeScript)
        if (comps[2] === "src.ts") {
            change.src.push(comps.join("/"));
        } else {
            change.dist.push(comps.join("/"));
        }
    });

    return changes;
}

function getLatestTag() {
    let seq = Promise.resolve();

    // @TODO: Pull
    if (false) {
        seq = seq.then(() => {
            console.log("Pulling remote changes...");
            return git([ "pull" ]);
        });
    }

    seq = seq.then(() => {
        return git([ "tag" ]).then((tags) => {
            tags = tags.split("\n").filter(tag => (tag.match(/^v[0-9]+\.[0-9]+\.[0-9]+\-/)));
            tags.sort(semver.compare)
            return tags.pop();
        });
    });

    return seq;
}

function findChanges(latest) {
    let seq = Promise.resolve();

    seq = seq.then(() => {
        return git(["diff", "--name-only", latest, "HEAD" ]).then((result) => {
            let filenames = { };
            result.split("\n").forEach((line) => {
                // e.g. packages/constants/index.d.ts
                let comps = line.trim().split("/");
                if (comps.length < 2) { return; }
                filenames[comps[1]] = true;
            });
            return Object.keys(filenames);
        });
    });

    seq = seq.then((filenames) => {
        return filenames.map((filename) => {
            let name = packages[filename].name;
            return {
                filename: filename,
                name: name,
                localVersion: getLocalVersion(name),
            }
        });
    });

    seq = seq.then((packages) => {
        let seq = Promise.resolve();
        packages.forEach((p) => {
            seq = seq.then(() => {
                return getNpmVersion(p.name).then((version) => {
                    p.npmVersion = version;
               });
            });
        });
        return seq.then(() => packages);
    });
    return seq;
}

async function getGitTag(filename) {
    let result = await git([ "log", "-n", "1", "--", filename ]);
    result = result.trim();
    if (!result) { return null; }
    result = result.match(/^commit\s+([0-9a-f]{40})\n/i);
    if (!result) { return null; }
    return result[1];
}

async function getDiff(filename, tag, nameOnly) {
    if (tag == null) { tag = "HEAD"; }
    let cmd = [ "diff", "--name-only", tag, "--", filename ]
    if (!nameOnly) { cmd.splice(1, 1); }
    try {
       let result = await git(cmd);
       result = result.trim();
       if (result === "") { return [ ]; }
       return result.split("\n");
    } catch (error) {
        // This tag does not exist, so compare against beginning of time
        // This happens when there is a new history (like an orphan branch)
        if (error.stderr.trim().match(/^fatal: bad object/)) {
            console.log("Could not find history; showing all");
            let cmd = [ "rev-list", "--max-parents=0", "HEAD" ];
            let tag = await git(cmd);
            return getDiff(filename, tag.trim(), nameOnly);
        }

        throw error;
    }
}

async function getUntracked(filename) {
    let cmd = [ "ls-files", "-o", "--exclude-standard"];
    if (filename) {
        cmd.push("--");
        cmd.push(filename);
    }
    let result = await git(cmd);
    result = result.trim();
    if (result === "") { return [ ]; }
    return result.split("\n");
}

module.exports = {
    findChanges: findChanges,
    getChanges: getChanges,
    getDiff: getDiff,
    getGitTag: getGitTag,
    getLatestTag: getLatestTag,
    getStatus: getStatus,
    getUntracked: getUntracked,
    run: git,
}
