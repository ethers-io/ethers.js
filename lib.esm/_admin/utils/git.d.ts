export declare function getGitTag(filename: string): Promise<null | string>;
export declare function getModifiedTime(filename: string): Promise<null | number>;
export interface GitLog {
    commit: string;
    author: string;
    date: string;
    body: string;
}
export declare function getLogs(files?: null | Array<string>, range?: null | {
    tag0: string;
    tag1: string;
}, limit?: null | number): Promise<Array<GitLog>>;
export declare function getDiff(filename: string, tag0: string, tag1: string): Promise<string>;
export declare function getTags(): Promise<Array<string>>;
//# sourceMappingURL=git.d.ts.map