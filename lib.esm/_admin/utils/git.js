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
    console.log("LL", log);
    if (!log) {
        return null;
    }
    for (let line of log.split("\n")) {
        line = line.trim();
        console.log("L", line);
        if (!line) {
            break;
        }
        const match = line.match(/^date:\s+(.*)$/i);
        console.log("M", match);
        if (match) {
            return (new Date(match[1].trim())).getTime();
            ;
        }
    }
    return null;
}
export async function getGitLog(filename, limit) {
    if (limit == null) {
        limit = 100;
    }
    const result = await run("git", ["log", "-n", String(limit), "--", filename]);
    if (!result.ok) {
        throw new Error(`git log error`);
    }
    let log = result.stdout.trim();
    if (!log) {
        return [];
    }
    const logs = [{ commit: "", author: "", date: "", body: "" }];
    for (const line of log.split("\n")) {
        const hashMatch = line.match(/^commit\s+([0-9a-f]{40})/i);
        if (hashMatch) {
            logs.push({ commit: hashMatch[1], author: "", date: "", body: "" });
        }
        else {
            if (line.startsWith("Author:")) {
                logs[logs.length - 1].author = line.substring(7).trim();
            }
            else if (line.startsWith("Date:")) {
                logs[logs.length - 1].date = line.substring(5).trim();
            }
            else {
                logs[logs.length - 1].body = (logs[logs.length - 1].body + " " + line).trim();
            }
        }
    }
    // Nix the bootstrap entry
    logs.shift();
    return logs;
}
//# sourceMappingURL=git.js.map