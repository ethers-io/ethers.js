import { spawnSync } from "child_process";

export class RunResult {
    readonly #cmd: string;
    readonly #status: null | number;
    readonly #stdout: string | Buffer;
    readonly #stderr: string | Buffer;

    constructor(progname: string, args: Array<string>, status: null | number, stdout: string | Buffer, stderr: string | Buffer) {
        this.#cmd = `${ progname } ${ args.map((a) => JSON.stringify(a))}`;
        this.#status = status;
        this.#stdout = stdout;
        this.#stderr = stderr;
    }

    get cmd(): string { return this.#cmd; }

    get stderr(): string | null {
        return this._stderr.toString() || null;
    }

    get _stderr(): string | Buffer {
        return this.#stderr;
    }

    get stdout(): string {
        return this._stdout.toString();
    }

    get _stdout(): string | Buffer {
        return this.#stdout;
    }

    get status(): null | number { return this.#status; }

    get ok(): boolean {
        return (this.#stderr.length === 0 && this.#status === 0);
    }

    assertOk(message?: string): void {
        if (!this.ok) {
            throw new Error(message || `failed to run: ${ this.#cmd }`);
        }
    }
};

export function run(progname: string, args?: Array<string>, currentWorkingDirectory?: string): RunResult {
    if (args == null) { args = [ ]; }

    const options: any = { };
    if (currentWorkingDirectory) { options.cwd = currentWorkingDirectory; }
    const child = spawnSync(progname, args, options);

    const result = new RunResult(progname, args, child.status, child.stdout, child.stderr);

    if (child.error) {
        const error = child.error;
        (<any>error).result = result;
        throw error;
    }

    return result;
}
