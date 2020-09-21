import { spawnSync } from "child_process";

export type RunResult = {
    stderr: string | null;
    _stderr: string | Buffer;

    stdout: string;
    _stdout: string | Buffer;

    status: number;
    ok: boolean;
};

export function run(progname: string, args?: Array<string>, currentWorkingDirectory?: string): RunResult {
    if (args == null) { args = [ ]; }

    const options: any = { };
    if (currentWorkingDirectory) { options.cwd = currentWorkingDirectory; }
    const child = spawnSync(progname, args, options);

    const result = {
        _stderr: child.stderr,
        stderr: (child.stderr.toString() || null),
        _stdout: child.stdout,
        stdout: child.stdout.toString(),
        status: child.status,
        ok: (child.stderr.length === 0 && child.status === 0)
    };

    if (child.error) {
        (<any>(child.error)).result = result;
        throw child.error;
    }

    return result;

/*
        const result: RunResult = {
            stderr: null,
            _stderr: Buffer.from([]),
            stdout: null,
            _stdout: Buffer.from([]),
            status: null,
            ok: false,
        };

        proc.stderr.on("data", (data) => {
            result._stderr = Buffer.concat([ result._stderr, data ]);
        });

        proc.stdout.on("data", (data) => {
            result._stdout = Buffer.concat([ result._stdout, data ]);
        });

        proc.on("error", (error) => {
            result.stderr = result._stderr.toString("utf8");
            result.stdout = result._stdout.toString("utf8");
            (<any>error).result = result;

            console.log("Error:", error);

            reject(error);
        });

        proc.on("close", (code) => {
            result.stderr = result._stderr.toString("utf8");
            result.stdout = result._stdout.toString("utf8");
            result.status = code;
            result.ok = (result._stderr.length === 0 && code === 0);
            resolve(result);
        });
    });
*/
}
