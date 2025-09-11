/// <reference types="node" />
/// <reference types="node" />
export declare class RunResult {
    #private;
    constructor(progname: string, args: Array<string>, status: null | number, stdout: string | Buffer, stderr: string | Buffer);
    get cmd(): string;
    get stderr(): string | null;
    get _stderr(): string | Buffer;
    get stdout(): string;
    get _stdout(): string | Buffer;
    get status(): null | number;
    get ok(): boolean;
    assertOk(message?: string): void;
}
export declare function run(progname: string, args?: Array<string>, currentWorkingDirectory?: string): RunResult;
//# sourceMappingURL=run.d.ts.map