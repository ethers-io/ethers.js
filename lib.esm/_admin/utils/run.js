import { spawnSync } from "child_process";
export class RunResult {
    #cmd;
    #status;
    #stdout;
    #stderr;
    constructor(progname, args, status, stdout, stderr) {
        this.#cmd = `${progname} ${args.map((a) => JSON.stringify(a))}`;
        this.#status = status;
        this.#stdout = stdout;
        this.#stderr = stderr;
    }
    get cmd() { return this.#cmd; }
    get stderr() {
        return this._stderr.toString() || null;
    }
    get _stderr() {
        return this.#stderr;
    }
    get stdout() {
        return this._stdout.toString();
    }
    get _stdout() {
        return this.#stdout;
    }
    get status() { return this.#status; }
    get ok() {
        return (this.#stderr.length === 0 && this.#status === 0);
    }
    assertOk(message) {
        if (!this.ok) {
            throw new Error(message || `failed to run: ${this.#cmd}`);
        }
    }
}
;
export function run(progname, args, currentWorkingDirectory) {
    if (args == null) {
        args = [];
    }
    const options = {};
    if (currentWorkingDirectory) {
        options.cwd = currentWorkingDirectory;
    }
    const child = spawnSync(progname, args, options);
    const result = new RunResult(progname, args, child.status, child.stdout, child.stderr);
    if (child.error) {
        const error = child.error;
        error.result = result;
        throw error;
    }
    return result;
}
//# sourceMappingURL=run.js.map