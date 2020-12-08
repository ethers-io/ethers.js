export declare function fetchGitHub(user: string, password: string, url: string, cacheOnly?: boolean): Promise<any[]>;
export declare function getIssues(): Promise<Array<any>>;
export declare function syncIssues(user: string, password: string): Promise<Array<any>>;
export declare function createRelease(user: string, password: string, tagName: string, title: string, body: string, prerelease?: boolean, commit?: string): Promise<string>;
