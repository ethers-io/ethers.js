import fs from "fs";

import * as local from "./local";
import { colorify } from "./log";
import * as npm from "./npm";
import { resolve } from "./path";
import { run } from "./run";
import { getDateTime, repeat } from "./utils";

const changelogPath = resolve("CHANGELOG.md");

export type Change = {
    title: string;
    version: string;
    date: string;
    content: string;
};

export async function generate(): Promise<string> {
    const lines = fs.readFileSync(changelogPath).toString().trim().split("\n");

    let firstLine: number = null;
    const versions: Array<string> = Object.keys(lines.reduce((accum, line, index) => {
        const match = line.match(/^ethers\/v([^ ]*)/);
        if (match) {
            if (firstLine == null) { firstLine = index; }
            accum[match[1]] = true;
        }
        return accum;
    }, <Record<string, boolean>>{ }));

    const version = local.getPackage("ethers").version;;
    const published = await npm.getPackage("ethers");

    if (versions.indexOf(version) >= 0) {
        const line = `Version ${ version } already in CHANGELOG. Please edit before committing.`;
        console.log(colorify.red(repeat("=", line.length)));
        console.log(colorify.red(line));
        console.log(colorify.red(repeat("=", line.length)));
    }

    const gitResult = await run("git", [ "log", (published.gitHead + "..") ]);
    if (!gitResult.ok) {
        console.log(gitResult);
        throw new Error("Error running git log");
    }

    let changes: Array<{ body: string, commit: string, date: string }> = [ ];
    gitResult.stdout.split("\n").forEach((line) => {
        if (line.toLowerCase().substring(0, 6) === "commit") {
            changes.push({
                commit: line.substring(6).trim(),
                date: null,
                body: ""
            });
        } else if (line.toLowerCase().substring(0, 5) === "date:") {
            changes[changes.length - 1].date = getDateTime(new Date(line.substring(5).trim()));
        } else if (line.substring(0, 1) === " ") {
            line = line.trim();
            if (line === "") { return; }
            changes[changes.length - 1].body += line + " ";
        }
    });

    const output: Array<string> = [ ];
    for (let i = 0; i < firstLine; i++) {
        output.push(lines[i]);
    }

    const newTitle = `ethers/v${ version } (${ getDateTime(new Date()) })`;
    output.push(newTitle);
    output.push(repeat("-", newTitle.length));
    output.push("");

    changes.forEach((change) => {
        let body = change.body.trim();
        let linkMatch = body.match(/(\((.*#.*)\))/)
        let commit = `[${ change.commit.substring(0, 7) }](https://github.com/ethers-io/ethers.js/commit/${ change.commit })`;
        let link = commit;
        if (linkMatch) {
            body = body.replace(/ *(\(.*#.*)\) */, "");
            link = linkMatch[2].replace(/#([0-9]+)/g, (all, issue) => {
                return `[#${ issue }](https://github.com/ethers-io/ethers.js/issues/${ issue })`;
            }) + "; " + commit;
        }
        output.push(`  - ${ body } (${ link })`);
    });

    output.push("");

    for (let i = firstLine; i < lines.length; i++) {
        output.push(lines[i]);
    }

    return output.join("\n");
}

export function getLatestChange(): Change {
    let result: Change = null;

    const lines = fs.readFileSync(changelogPath).toString().split("\n");
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/ethers\/([^\(]*)\(([^\)]*)\)/);
        if (match) {
            if (result) { break; }
            result = {
                title: line.trim(),
                version: match[1].trim(),
                date: match[2].trim(),
                content: ""
            };
        } else if (result) {
            if (!line.trim().match(/^-+$/)) {
                result.content += line.trim() + "\n";
            }
        }
    }
    result.content = result.content.trim();

    return result;
}
