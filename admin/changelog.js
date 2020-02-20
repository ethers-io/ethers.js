"use strict";

const fs = require("fs");
const resolve = require("path").resolve;

const git = require("./git");
const local = require("./local");
const npm = require("./npm");
const utils = require("./utils");

const ChangelogPath = resolve(__dirname, "../CHANGELOG.md");

async function generate() {

    // Get each section of the Changelog
    let existing = fs.readFileSync(ChangelogPath).toString().split("\n");
    let sections = [ ];
    let lastLine = existing[0];
    existing.slice(1).forEach((line) => {
        if (line.substring(0, 5) === "=====" || line.substring(0, 5) === "-----") {
            sections.push({
                title: lastLine,
                underline: line.substring(0, 1),
                body: [ ]
            });
            lastLine = null;
            return;
        } else if (lastLine) {
            sections[sections.length - 1].body.push(lastLine);
        }
        lastLine = line;
    });
    sections[sections.length - 1].body.push(lastLine);

    let lastVersion = await npm.getPackageVersion("ethers");

    let logs = await git.run([ "log", (lastVersion.gitHead + "..") ]);

    let changes = [ ];
    logs.split("\n").forEach((line) => {
        if (line.toLowerCase().substring(0, 6) === "commit") {
            changes.push({
                commit: line.substring(6).trim(),
                body: [ ]
            });
        } else if (line.toLowerCase().substring(0, 5) === "date:") {
            changes[changes.length - 1].date = utils.getDateTime(new Date(line.substring(5).trim()));
        } else if (line.substring(0, 1) === " ") {
            line = line.trim();
            if (line === "") { return; }
            changes[changes.length - 1].body += line + " ";
        }
    });

    // @TODO:
    // ethers/version ([date](tag))
    let newSection = {
        title: `ethers/v${ local.loadPackage("ethers").version } (${utils.getDateTime(new Date())})`,
        underline: "-",
        body: [ ]
    }

    // Delete duplicate sections for the same version (ran update multiple times)
    while (sections[1].title === newSection.title) {
        sections.splice(1, 1);
    }

    changes.forEach((change) => {
        let body = change.body.trim();
        let link = body.match(/(\((.*#.*)\))/)
        let commit = `[${ change.commit.substring(0, 7) }](https://github.com/ethers-io/ethers.js/commit/${ change.commit })`;
        if (link) {
            body = body.replace(/ *(\(.*#.*)\) */, "");
            link = link[2].replace(/#([0-9]+)/g, (all, issue) => {
                return `[#${ issue }](https://github.com/ethers-io/ethers.js/issues/${ issue })`;
            }) + "; " + commit;
        } else {
            link = commit;
        }
        newSection.body.push(`  - ${ body } (${ link })`);
    });

    sections.splice(1, 0, newSection);


    let formatted = [ ];
    sections.forEach((section) => {
        formatted.push(section.title);
        formatted.push(utils.repeat(section.underline, section.title.length));
        formatted.push("");
        section.body.forEach((line) => {
            line = line.trim();
            if (line === "") { return; }
            if (line.substring(0, 1) === "-") {
                line = "- " + line.substring(1).trim();
            }
            if (section.underline === "-") {
                line = "  " + line;
            }
            formatted.push(line);
        });
        formatted.push("");
    });

    return formatted.join("\n") + "\n";
}

function getChanges() {
    const changes = [ ];

    let lastLine = null;
    fs.readFileSync(ChangelogPath).toString().split("\n").forEach((line) => {
        line = line.trim();
        if (line === "") { return; }

        if (line.substring(0, 5) === "-----") {
            changes.push({ title: lastLine, lines: [ ] });
        } else if (line.substring(0, 1) === "-" && changes.length) {
            changes[changes.length - 1].lines.push(line);
        }
        lastLine = line;
    });

    return changes;
}

function latestChange() {
    const recent = getChanges()[0];

    const match = recent.title.match(/ethers\/([^\(]*)\(([^\)]*)\)/);

    return {
        title: recent.title,
        version: match[1].trim(),
        data: match[2].trim(),
        content: recent.lines.join("\n")
    };
}

module.exports = {
    generate: generate,
    latestChange: latestChange,
    ChangelogPath: ChangelogPath,
}

