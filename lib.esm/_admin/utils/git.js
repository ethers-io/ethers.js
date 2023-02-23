import { dirname } from "path";
import { fileURLToPath } from "url";
import { run } from "./run.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Returns the most recent git commit hash for a given filename
export async function getGitTag(filename) {
    const result = await run("git", ["log", "-n", "1", "--", filename], __dirname);
    if (!result.ok) {
        throw new Error(`git log error`);
    }
    let log = result.stdout.trim();
    if (!log) {
        return null;
    }
    const hashMatch = log.match(/^commit\s+([0-9a-f]{40})\n/i);
    if (!hashMatch) {
        return null;
    }
    return hashMatch[1];
}
export async function getModifiedTime(filename) {
    const result = await run("git", ["log", "-n", "1", "--", filename], __dirname);
    if (!result.ok) {
        throw new Error(`git log error`);
    }
    let log = result.stdout.trim();
    if (!log) {
        return null;
    }
    for (let line of log.split("\n")) {
        line = line.trim();
        if (!line) {
            break;
        }
        const match = line.match(/^date:\s+(.*)$/i);
        if (match) {
            return (new Date(match[1].trim())).getTime();
            ;
        }
    }
    return null;
}
export async function getLogs(files, range, limit) {
    const args = ["log", "-n", String((limit != null) ? limit : 100)];
    if (range) {
        args.push(`${range.tag0}..${range.tag1}`);
    }
    if (files) {
        args.push("--");
        files.forEach((f) => args.push(f));
    }
    const exec = await run("git", args);
    if (!exec.ok) {
        throw new Error(`git log error`);
    }
    const log = exec.stdout.trim();
    if (!log) {
        return [];
    }
    const results = [{ commit: "", author: "", date: "", body: "" }];
    for (const line of log.split("\n")) {
        const hashMatch = line.match(/^commit\s+([0-9a-f]{40})/i);
        if (hashMatch) {
            results.push({ commit: hashMatch[1], author: "", date: "", body: "" });
        }
        else {
            if (line.startsWith("Author:")) {
                results[results.length - 1].author = line.substring(7).trim();
            }
            else if (line.startsWith("Date:")) {
                results[results.length - 1].date = line.substring(5).trim();
            }
            else {
                results[results.length - 1].body = (results[results.length - 1].body + " " + line).trim();
            }
        }
    }
    // Nix the bootstrap entry
    results.shift();
    return results;
}
export async function getDiff(filename, tag0, tag1) {
    const result = await run("git", ["diff", `${tag0}..${tag1}`, "--", filename]);
    if (!result.ok) {
        throw new Error(`git log error`);
    }
    return result.stdout.trim();
}
//# sourceMappingURL=git.js.map