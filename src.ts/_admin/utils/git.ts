import { run } from "./run.js";

// Returns the most recent git commit hash for a given filename
export async function getGitTag(filename: string): Promise<null | string> {
    const result = await run("git", [ "log", "-n", "1", "--", filename ]);
    if (!result.ok) { throw new Error(`git log error`); }

    let log = result.stdout.trim();
    if (!log) { return null; }

    const hashMatch = log.match(/^commit\s+([0-9a-f]{40})\n/i);
    if (!hashMatch) { return null; }
    return hashMatch[1];
}

export interface GitLog {
    commit: string;
    author: string;
    date: string;
    body: string;
}

export async function getGitLog(filename: string, limit?: number): Promise<Array<GitLog>> {
    if (limit == null) { limit = 100; }
    const result = await run("git", [ "log", "-n", String(limit), "--", filename ]);
    if (!result.ok) { throw new Error(`git log error`); }

    let log = result.stdout.trim();
    if (!log) { return [ ]; }

    const logs: Array<GitLog> = [ { commit: "", author: "", date: "", body: "" } ];
    for (const line of log.split("\n")) {
        const hashMatch = line.match(/^commit\s+([0-9a-f]{40})/i);
         if (hashMatch) {
             logs.push({ commit: hashMatch[1], author: "", date: "", body: "" });
         } else {
             if (line.startsWith("Author:")) {
                 logs[logs.length - 1].author = line.substring(7).trim();
             } else if (line.startsWith("Date:")) {
                 logs[logs.length - 1].date = line.substring(5).trim();
             } else {
                 logs[logs.length - 1].body = (logs[logs.length - 1].body + " " + line).trim();
             }
         }
    }

    // Nix the bootstrap entry
    logs.shift();

    return logs;
}
