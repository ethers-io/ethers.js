import fs from "fs";
import { getLogs } from "./utils/git.js";
import { loadJson } from "./utils/json.js";
import { resolve } from "./utils/path.js";
import { getVersions } from "./utils/npm.js";
import { getDateTime } from "./utils/date.js";
function repeat(c, length) {
    if (c.length === 0) {
        throw new Error("too short");
    }
    while (c.length < length) {
        c += c;
    }
    return c.substring(0, length);
}
async function getChanges(tag0, tag1) {
    const result = [];
    const logs = await getLogs(null, { tag0, tag1 });
    for (const log of logs) {
        if (log.body.startsWith("admin:") || log.body.startsWith("docs:")) {
            continue;
        }
        let message = log.body;
        const issues = [];
        message = message.replace(/\((([0-9#,]|\s)*)\)/g, (all, text) => {
            text = text.replace(/#([0-9]+)/g, (all, issue) => {
                issues.push(issue);
                return "";
            });
            if (text.replace(/,/g, "").trim()) {
                console.log(`WARNING: commit leftovers ${JSON.stringify(text)}`);
            }
            return "";
        }).replace(/\.+\s*$/, "").trim();
        result.push({ message, issues, commit: log.commit });
    }
    return result;
}
(async function () {
    // Get the already included versions in the CHANGELOG
    const present = [{ version: "null", body: [] }];
    {
        const content = fs.readFileSync(resolve("CHANGELOG.md")).toString();
        for (const line of content.split("\n")) {
            let match = line.match(/^ethers\/v(\S+)\s/);
            if (match) {
                present.push({ version: match[1], body: [line] });
            }
            else {
                present[present.length - 1].body.push(line);
            }
        }
        for (const { body } of present) {
            while (body[body.length - 1].trim() === "") {
                body.pop();
            }
        }
    }
    // Get the remote versions (along with their date and gitHead)
    let versions = await getVersions("ethers");
    versions = versions.filter((v) => (v.version.match(/^6\.[0-9]+\.[0-9]+$/)));
    const entries = [];
    const getPresent = (version) => {
        const pres = present.filter((p) => (p.version === version));
        return pres.length ? pres[0] : null;
    };
    // Add the first entry, which has no previous version to compare against
    {
        const pres = getPresent(versions[0].version);
        if (pres) {
            entries.push(pres);
        }
        else {
            entries.push({
                date: getDateTime(new Date(versions[0].date)),
                version: versions[0].version,
                changes: [{
                        message: "Initial release",
                        issues: [],
                        commit: versions[0].gitHead
                    }]
            });
        }
    }
    // Add each version, with preference given to present entries, as
    // they may have been updated manually
    let lastVer = versions[0];
    for (let i = 1; i < versions.length; i++) {
        const ver = versions[i];
        // Prefer present entries
        const pres = getPresent(ver.version);
        if (pres) {
            entries.push(pres);
            lastVer = ver;
            continue;
        }
        // Get the entry info from git
        const version = ver.version;
        const date = getDateTime(new Date(ver.date));
        const changes = await getChanges(lastVer.gitHead, ver.gitHead);
        entries.push({ date, version, changes });
        lastVer = ver;
    }
    // If this is a new version (not present in npm) add the changes
    // from the lastest version until HEAD.
    const curVer = loadJson(resolve("package.json")).version;
    if (curVer !== lastVer) {
        // Include any present entry, as it was placed here by a
        // previous run of update-changelog and may have been
        // modified manually
        const pres = getPresent(curVer);
        if (pres) {
            console.log(`WARNING: existing entry for ${curVer}; duplicating`);
            entries.push(pres);
        }
        // Also include theentry from git
        const latest = await getChanges(lastVer.gitHead, "HEAD");
        if (latest.length) {
            entries.push({
                date: getDateTime(new Date()),
                version: curVer,
                changes: latest
            });
        }
    }
    // Gerenate the CHANGELOG.md output
    const output = [];
    output.push("Change Log");
    output.push("==========");
    output.push("");
    output.push("This change log is maintained by `src.ts/_admin/update-changelog.ts` but may also be manually updated.");
    output.push("");
    for (const ver of entries.reverse()) {
        // Present entry; include verbatim
        if ("body" in ver) {
            ver.body.forEach((line) => output.push(line));
            output.push("");
            continue;
        }
        // Entry from git; format it nicely
        const title = `ethers/v${ver.version} (${ver.date})`;
        output.push(title);
        output.push(repeat("-", title.length));
        output.push("");
        for (const change of ver.changes) {
            let line = `  - ${change.message} (`;
            line += change.issues.map((i) => {
                return `[#${i}](https:/\/github.com/ethers-io/ethers.js/issues/${i})`;
            }).join(", ");
            if (change.issues.length) {
                line += "; ";
            }
            line += `[${change.commit.substring(0, 7)}](https:/\/github.com/ethers-io/ethers.js/commit/${change.commit})).`;
            output.push(line);
        }
        output.push("");
    }
    fs.writeFileSync(resolve("CHANGELOG.md"), output.join("\n"));
})();
//# sourceMappingURL=update-changelog.js.map