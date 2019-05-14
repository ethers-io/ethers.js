"use strict";

const fs = require("fs");
const resolve = require("path").resolve;

const git = require("./git");
const local = require("./local");
const utils = require("./utils");

async function generate() {

    let version = local.loadPackage("ethers").version;
    let latest = await git.getLatestTag();
    let date = utils.today();
    let ethersVersion = "ethers/" + version;
    let log = await git.run([ "log", "--format=%B", (latest + "..") ])

    let existing = fs.readFileSync(resolve(__dirname, "../CHANGELOG.md")).toString().split("\n");

    let sections = [ [ ] ];

    for (let i = 0; i < existing.length; i++) {
        let line = existing[i];
        let lastSection = sections[sections.length - 1];
        if (line.substring(0, 3) === "---" || line.substring(0, 3) === "===") {
            sections.push([ lastSection.pop(), line ])
        } else {
            lastSection.push(line);
        }
    }

    // Snip off the dummy first section
    sections.shift();

    let output = [ ];

    let addSection = (section) => {

        // Add the header with the same underline style
        let header = section[0];
        output.push(header);
        output.push(utils.repeat(section[1], header.length));

        // Add gap before body
        output.push("");

        // For each line, properly indent it (the root body does not get indented)
        section.slice(2).forEach((line) => {
            line = line.trim();
            if (line === "") { return; }
            if (header.trim().toLowerCase() !== "changelog") {
                if (line.substring(0, 1) !== "*") {
                    line = "  " + line;
                }
                line = "  " + line;
            }
            output.push(line);
        });

        // Add gap after body
        output.push("");
    }

    let newSection = [];
    {
        let header = "ethers/" + version + " (" + date + ")";
        newSection.push(header);
        newSection.push(utils.repeat("-", header.length));
        log.split("\n").forEach((line) => {
        line = line.trim();
            if (line === "") { return; }
            newSection.push("  * " + line);
        });
    }

    sections.forEach((section) => {
        let header = section[0].split(" ");

        // Check if this is the current version, we may need to update
        if (header.length === 2) {
            // This new section obsoletes the old new section...
            if (header[0] === ethersVersion) {
                addSection(newSection);
                newSection = null;
                return;

            // Put the new section before any old sections
            } else if (newSection) {
                addSection(newSection);
            }
        }

        addSection(section);
    });

    return output.join("\n") + "\n";
}

module.exports = {
    generate: generate
}
