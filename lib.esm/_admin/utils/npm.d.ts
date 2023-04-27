export declare function _getNpmPackage(name: string): Promise<any>;
export type Version = {
    version: string;
    gitHead: string;
    date: string;
};
export declare function getVersions(name: string): Promise<Array<Version>>;
//# sourceMappingURL=npm.d.ts.map